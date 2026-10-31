import {accountKey} from './account-storage';
import {useEffect,useRef,useState} from 'react';
export const GIFTS=[
 {id:'coin',name:'Moeda',icon:'🪙',cost:1},
 {id:'heart',name:'Coração',icon:'🧡',cost:5},
 {id:'rose',name:'Rosa',icon:'🌹',cost:10},
 {id:'star',name:'Estrela',icon:'🌟',cost:25},
 {id:'game',name:'Comando',icon:'🎮',cost:50},
 {id:'rocket',name:'Foguetão',icon:'🚀',cost:100},
 {id:'crown',name:'Coroa',icon:'👑',cost:500},
 {id:'galaxy',name:'Galáxia',icon:'🌌',cost:1000},
] as const;
export type Gift=typeof GIFTS[number];
export type GiftResult={ok:boolean;message:string};
export type Wallet={balance:number;popularity:Record<string,number>;diamonds:Record<string,number>};
export const diamondValue=(diamonds:number)=>new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(diamonds/100);
export const WALLET_KEY='omlet-gift-wallet-v1';
export function readWallet(raw:string|null):Wallet{
 if(raw===null)return {balance:0,popularity:{},diamonds:{}};
 const value=JSON.parse(raw);
 if(!value||!Number.isSafeInteger(value.balance)||value.balance<0||!value.popularity||typeof value.popularity!=='object'||Array.isArray(value.popularity)||!Object.entries(value.popularity).every(([id,n])=>/^s[0-4]$/.test(id)&&Number.isSafeInteger(n)&&Number(n)>=0))throw new Error('Saldo inválido');
 // Older wallet popularity records contain gift points only (10 per spent coin).
 const diamonds=value.diamonds===undefined?Object.fromEntries(Object.entries(value.popularity).map(([id,points])=>[id,Math.floor(Number(points)/10)])):value.diamonds;
 if(!diamonds||typeof diamonds!=='object'||Array.isArray(diamonds)||!Object.entries(diamonds).every(([id,n])=>(/^s[0-4]$/.test(id)||id==='me')&&Number.isSafeInteger(n)&&Number(n)>=0))throw new Error('Diamantes inválidos');
 return {balance:value.balance,popularity:value.popularity,diamonds};
}
export function spendGift(wallet:Wallet,streamId:string,giftId:string):Wallet|null{
 const gift=GIFTS.find(g=>g.id===giftId);if(!gift||!/^s[0-4]$/.test(streamId)||wallet.balance<gift.cost)return null;
 if((wallet.diamonds[streamId]??0)>Number.MAX_SAFE_INTEGER-gift.cost)return null;
 return {balance:wallet.balance-gift.cost,diamonds:{...wallet.diamonds,[streamId]:(wallet.diamonds[streamId]??0)+gift.cost},popularity:{...wallet.popularity,[streamId]:Math.min(Number.MAX_SAFE_INTEGER,(wallet.popularity[streamId]??0)+gift.cost*10)}};
}
export function useGiftWallet(){
 const unavailable=async():Promise<GiftResult>=>({ok:false,message:'A carteira e os presentes ainda não estão disponíveis.'});
 // Keep released account balances separate from the retired sample wallet.
 let balance=0;
 try{const key=accountKey('egg-account-coins-v1');if(key.includes(':account:')){const amount=JSON.parse(localStorage.getItem(key)??'0');if(Number.isSafeInteger(amount)&&amount>=0)balance=amount}}catch{}
 return {balance,popularity:{} as Record<string,number>,diamonds:{} as Record<string,number>,sendGift:async(_streamId:string,_giftId:string)=>unavailable(),buyDemoCoins:async(_coins:number)=>unavailable()};
}
