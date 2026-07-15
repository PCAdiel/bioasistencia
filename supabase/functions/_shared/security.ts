export const corsHeaders={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'};
export function invalid(condition:boolean,message:string){if(condition)throw new Error(message)}
export function validateDescriptor(value:unknown):number[]{invalid(!Array.isArray(value)||value.length!==128,'Descriptor facial inválido.'); const d=value as number[]; invalid(d.some(x=>typeof x!=='number'||!Number.isFinite(x)),'Descriptor facial inválido.');return d;}
export function distance(a:number[],b:number[]){return Math.sqrt(a.reduce((sum,x,i)=>sum+(x-b[i])**2,0));}
