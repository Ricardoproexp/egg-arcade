import {createFileRoute} from '@tanstack/react-router';
export const Route=createFileRoute('/loja')({head:()=>({meta:[{title:'Loja de moedas · Egg Arcade'},{name:'description',content:'Escolhe o teu pacote de moedas para presentes nas lives.'}]}),component:()=>null});
