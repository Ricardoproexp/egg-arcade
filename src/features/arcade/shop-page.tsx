import {BackLink} from './back-link';
import {ArrowLeft,Coins} from 'lucide-react';
import {Button} from '@/components/ui/button';
export const COIN_PACKS=[5,10,25,50,100,250,500,1000,2500,5000,10000] as const;
export const coinPriceCents=(coins:number)=>coins*2;
export const euroPrice=(coins:number)=>new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(coinPriceCents(coins)/100);
export function ShopPage(_props:{balance:number;onBuy:(coins:number)=>Promise<{ok:boolean;message:string}>}){
 return <section className="coin-shop"><BackLink className="publication-back"><ArrowLeft/>Voltar</BackLink><header className="shop-heading"><div><span className="shop-eyebrow">EGG ARCADE</span><h1>Apoia os teus criadores favoritos.</h1><p>A loja de moedas estará disponível em breve.</p></div><span className="shop-coin-art" aria-hidden="true">🪙</span></header><div className="launch-empty"><Coins/><h2>Estamos a preparar a loja</h2><p>As compras e os pagamentos ainda não estão disponíveis.</p><Button disabled>Disponível em breve</Button></div></section>;
}
