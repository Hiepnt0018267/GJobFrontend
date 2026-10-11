import assert from 'node:assert/strict'
import { before, after, test } from 'node:test'
import { createServer } from 'vite'

let server,service,api,operation,errorMapper
before(async()=>{
  server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'})
  service=(await server.ssrLoadModule('/src/services/cvService.ts')).cvService
  api=(await server.ssrLoadModule('/src/services/api.ts')).default
  operation=await server.ssrLoadModule('/src/utils/extractionOperation.ts')
  errorMapper=await server.ssrLoadModule('/src/utils/apiError.ts')
})
after(async()=>{await server?.close()})

test('extraction request uses centrally supplied deadline plus network margin',async()=>{
  const get=api.get,post=api.post;const calls=[]
  api.get=async path=>{assert.equal(path,'/api/v1/candidate/cvs/extraction-policy');return{data:{operation_timeout_ms:230000,request_timeout_ms:250000}}}
  api.post=async(path,body,options)=>{calls.push({path,options});return{data:{status:'SUCCEEDED'}}}
  try{assert.equal((await service.triggerExtraction('synthetic')).status,'SUCCEEDED');assert.equal(calls[0].options.timeout,250000);assert.equal(calls[0].path,'/api/v1/candidate/cvs/synthetic/extractions')}
  finally{api.get=get;api.post=post}
})

test('incompatible timing contract refuses to start POST rather than silently use120s',async()=>{
  const get=api.get,post=api.post;let calls=0
  api.get=async()=>({data:{operation_timeout_ms:230000,request_timeout_ms:220000}})
  api.post=async()=>{calls++;return{data:{}}}
  try{await assert.rejects(service.triggerExtraction('synthetic'));assert.equal(calls,0)}finally{api.get=get;api.post=post}
})

test('loading lock remains pending until resolution, duplicate click starts no work',async()=>{
  const lock={current:false};let finish,calls=0
  const work=()=>{calls++;return new Promise(resolve=>{finish=resolve})}
  const pending=operation.runExtractionExclusive(lock,work)
  assert.equal(lock.current,true)
  await operation.runExtractionExclusive(lock,work)
  assert.equal(calls,1);assert.equal(lock.current,true)
  finish('done');assert.equal(await pending,'done');assert.equal(lock.current,false)
})

test('rejected extraction releases loading lock for explicit later retry',async()=>{
  const lock={current:false}
  await assert.rejects(operation.runExtractionExclusive(lock,async()=>{throw new Error('failed')}))
  assert.equal(lock.current,false)
  assert.equal(await operation.runExtractionExclusive(lock,async()=>'next'),'next')
})

test('candidate error text explains failure without provider internals',()=>{
  for(const code of ['AI_PROVIDER_TIMEOUT','AI_OPERATION_DEADLINE_EXCEEDED','AI_CONTEXT_BUDGET_EXCEEDED','AI_OUTPUT_BUDGET_EXCEEDED','AI_JSON_INVALID','AI_SCHEMA_INVALID','AI_CORRECTION_FAILED']){
    const message=errorMapper.cvExtractionFailureMessage(code)
    assert.equal(typeof message,'string');assert.equal(/num_ctx|n_discard|qwen|stack trace/i.test(message),false)
  }
})
