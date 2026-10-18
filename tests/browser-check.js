async (page) => {
 const check=(ok,message)=>{if(!ok)throw Error(message)};
 if(!page.url().startsWith('http'))await page.goto('http://127.0.0.1:4173/');else await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 const layouts=[];
 for(const width of [390,1100]){await page.setViewportSize({width,height:900});for(const name of ['PLAY','VOICES','CHORDS','DRUMS','PERFORM','DUCKING']){await page.getByRole('tab',{name,exact:true}).click();const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);check(!overflow,name+' overflows at'+width);layouts.push({width,page:name,overflow});}}
 await page.getByRole('tab',{name:'PLAY',exact:true}).click();await page.getByRole('button',{name:/START AUDIO/}).click();await page.waitForFunction(()=>window.pxlDub.stats.statuses>3);
 const signal=await page.evaluate(async()=>{const {node,context}=window.pxlDub;const a=context.createAnalyser();a.fftSize=2048;node.connect(a);await new Promise(r=>setTimeout(r,100));const samples=new Float32Array(2048);a.getFloatTimeDomainData(samples);node.disconnect(a);return {finite:[...samples].every(Number.isFinite),energy:samples.reduce((s,x)=>s+x*x,0),rate:context.sampleRate}});check(signal.finite&&signal.energy>1e-6,'no valid browser audio');
 await page.evaluate(()=>window.pxlDub.context.suspend());await page.waitForFunction(()=>document.querySelector('#audio-status').textContent.includes('SUSPENDED'));await page.getByRole('button',{name:/^RUN/}).click();await page.waitForFunction(()=>document.querySelector('#audio-status').textContent.includes('RUNNING'));
 await page.getByRole('button',{name:'PANIC',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('#audio-status').classList.contains('running'));
 await page.locator('#patch-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{broken')});await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Could not load patch'));
 await page.locator('#tempo').fill('137.5');await page.locator('#tempo').press('Tab');await page.getByRole('tab',{name:'VOICES',exact:true}).click();check(Number(await page.locator('#page-1 input[data-control="TEMPO"]').inputValue())===137.5,'tempo controls disagree');
 await page.getByRole('tab',{name:'DRUMS',exact:true}).click();await page.getByRole('button',{name:'EDIT ACCENTS',exact:true}).click();const before=await page.evaluate(()=>window.pxlDub.patch.params);await page.getByRole('button',{name:'KICK step 1',exact:true}).click();const after=await page.evaluate(()=>window.pxlDub.patch.params);check(after.some((v,i)=>v!==before[i]),'touch accents do not edit');
 const error=await page.evaluate(()=>window.pxlDub.stats.error);check(error===null,'runtime error:'+error);
 return {layouts,signal,resume:'passed',panic:'passed',malformedImport:'passed',fractionalTempo:'passed',touchAccents:'passed',runtimeError:error};
}
