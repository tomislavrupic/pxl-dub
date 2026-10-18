// SPDX-License-Identifier: GPL-3.0-only
// Fixed-memory bridge shared by native parity tests and the AudioWorklet.
#include "Engine.generated.h"
#include <new>
using namespace pxldub;
static Engine engine;
static int32_t audio[128];
static float status[227];
static uint8_t pings[EN_PINGS_N];
static char formatted[64];
static float tempo=122;
static unsigned customScale=0;
extern "C" {
void dub_init(){new(&engine) Engine{};engine.en_init();engine.nativeDucking=true;tempo=122;customScale=0;}
void dub_set(int p,int value){if(p<0||p>=P_NPARAMS||p==P_MIDI)return;const auto* d=engine.en_param_info(p);value=value<d->lo?d->lo:value>d->hi?d->hi:value;engine.apply(p,value);if(p==P_MODE&&!customScale)engine.pool_set(engine.EN_MODE_POOL[value]);if(p==P_TEMPO)tempo=(float)value;}
void dub_set_duck(int layer,float value){engine.setLayerDuck(layer,value*.01f);}
void dub_release(float ms){engine.setDuckRelease(ms);}
void dub_tempo(float bpm){if(bpm>=30&&bpm<=320)tempo=bpm;}
void dub_play(int on){engine.en_play(on!=0);}
void dub_config(int key,int value){if(key==0){engine.mutes=(unsigned)value&31;engine.lanes();}else if(key==1){customScale=(unsigned)value&4095;engine.pool_set((customScale?customScale:engine.EN_MODE_POOL[engine.par[P_MODE]])|1u);}else if(key==2)engine.en_frozen=value!=0;else if(key==3){engine.perf=(unsigned)value&31;engine.lanes();}else if(key==4)engine.fxm=(unsigned)value&65535;}
void dub_piece(int piece){if(piece<0||piece>=8)return;int16_t values[P_NPARAMS];uint16_t pool;engine.en_piece(piece,values,&pool);for(int p=0;p<P_NPARAMS;++p)if(p!=P_MIDI&&p!=P_TUNE)engine.apply(p,values[p]);customScale=0;engine.pool_set(pool);tempo=values[P_TEMPO];engine.mutes=0;engine.en_frozen=0;engine.pings_have=0;engine.regrow();}
void dub_action(int action){if(action==1){if(engine.en_playing)engine.change_pending=1;else engine.chord_change();}else if(action==2){engine.pings_have=0;engine.regrow();}else if(action==3){int values[P_NPARAMS];for(int i=0;i<P_NPARAMS;++i)values[i]=engine.par[i];float amounts[6];for(int i=0;i<6;++i)amounts[i]=engine.layerDuckTarget[i];uint8_t loops[EN_PINGS_N];engine.en_pings_get(loops);const float oldTempo=tempo,oldRelease=engine.duck_rel;const auto scale=customScale,mutes=engine.mutes;const auto frozen=engine.en_frozen;dub_init();for(int i=0;i<P_NPARAMS;++i)engine.apply(i,values[i]);for(int i=0;i<6;++i)engine.setLayerDuck(i,amounts[i]);engine.duck_rel=oldRelease;tempo=oldTempo;dub_config(0,(int)mutes);dub_config(1,(int)scale);dub_config(2,frozen);engine.en_pings(loops);}}
int32_t* dub_audio(){return audio;}
uint8_t* dub_pings(){engine.en_pings_get(pings);return pings;}
void dub_restore_pings(){engine.en_pings(pings);}
void dub_render(){engine.step_len=44100.f*60.f/(tempo*4.f);engine.echo_len_t=fm_minf((float)(TAPE_N-8),engine.ETIME_BEATS[engine.par[P_ETIME]]*(60.f/tempo)*TAPE_SR);engine.en_render(audio,64,3072);}
float* dub_status(){for(int i=0;i<5;++i)status[i]=engine.visualPeak[i];status[5]=0;for(auto x:audio)status[5]=fm_maxf(status[5],fm_fabsf((float)x/8388608.f));status[6]=engine.visualReduction;status[7]=(float)engine.en_bars;status[8]=engine.en_chord_root;status[9]=engine.en_section;status[10]=engine.en_phrase_bar;for(int i=0;i<4;++i)status[11+i]=engine.en_chord[i];status[15]=tempo;status[16]=engine.en_playing;for(int i=0;i<128;++i)status[17+i]=(float)engine.en_scope[(engine.en_scope_w+i*2)&255]/32768.f;engine.en_pings_get(pings);for(int i=0;i<EN_PINGS_N;++i)status[145+i]=pings[i];return status;}
int dub_param_count(){return P_NPARAMS;}
int dub_param_lo(int p){return p>=0&&p<P_NPARAMS?engine.en_param_info(p)->lo:0;}
int dub_param_hi(int p){return p>=0&&p<P_NPARAMS?engine.en_param_info(p)->hi:0;}
int dub_param_value(int p){return p>=0&&p<P_NPARAMS?engine.par[p]:0;}
const char* dub_param_name(int p){return p>=0&&p<P_NPARAMS?engine.en_param_info(p)->name:"";}
const char* dub_param_text(int p,int v){if(p>=0&&p<P_NPARAMS)engine.en_param_text(p,v,formatted);else formatted[0]=0;return formatted;}
const char* dub_piece_name(int p){return p>=0&&p<8?engine.en_piece_name(p):"";}
const char* dub_voice_name(int layer,int p){return layer==0?engine.EN_CV_NAME[p<0?0:p>6?6:p]:layer==1?engine.EN_PV_NAME[p<0?0:p>4?4:p]:layer==2?engine.EN_BV_NAME[p<0?0:p>4?4:p]:engine.EN_KIT_NAME[p<0?0:p>4?4:p];}
const char* dub_mode_name(int p){return engine.EN_MODE_NAME[p<0?0:p>7?7:p];}
int dub_mode_pool(int p){return engine.EN_MODE_POOL[p<0?0:p>7?7:p];}
const char* dub_effect_name(int p){return engine.EN_FX_NAME[p<0?0:p>15?15:p];}
}
