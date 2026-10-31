import {mkdir,copyFile} from 'node:fs/promises';
for(const route of ['ao-vivo','chat','comunidades','descobrir','perfil','publicacao','loja','pesquisar']){
 await mkdir(`dist/${route}`,{recursive:true});
 await copyFile('dist/index.html',`dist/${route}/index.html`);
}
