import {validImage} from './store';
// Store a compact portrait instead of a full camera image in the account state.
export async function readGroupPhoto(file:File):Promise<string>{
 if(!validImage(file)||!file.size)throw new Error('Escolhe uma imagem JPEG, PNG ou WebP até 2 MB.');
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();image.src=url;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=320;canvas.height=320;
  const context=canvas.getContext('2d');if(!context)throw new Error('Não foi possível preparar a foto.');
  const side=Math.min(image.naturalWidth,image.naturalHeight);
  if(!side)throw new Error('A imagem não é válida.');
  context.drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,0,0,320,320);
  return canvas.toDataURL('image/webp',0.85);
 }catch(error){throw new Error(error instanceof Error&&error.message==='Não foi possível preparar a foto.'?error.message:'Não foi possível abrir esta imagem. Experimenta outra.')}finally{URL.revokeObjectURL(url)}
}
