import {useState} from 'react';
import {Gift as GiftIcon,Coins,Flame,Check} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {GIFTS,type GiftResult} from './gifts';
export function GiftControls({balance,creator,send,notify}:{balance:number;creator:string;send:(id:string)=>Promise<GiftResult>;notify:(message:string)=>void}){
 const [open,setOpen]=useState(false),[selected,setSelected]=useState<string>('coin'),[sending,setSending]=useState(false),[feedback,setFeedback]=useState('');
 const gift=GIFTS.find(g=>g.id===selected)!;
 async function submit(id:string){if(sending)return;setSending(true);try{const result=await send(id);if(result.ok){notify('');setFeedback('');setOpen(false)}else{notify(result.message);setFeedback(result.message)}}finally{setSending(false)}}
 return <><button type="button" className="quick-gift-coin" disabled={sending||balance<1} aria-label={balance>0?`Enviar 1 moeda. Saldo: ${balance} moedas`:'Moeda: saldo insuficiente'} title={balance>0?'Enviar 1 moeda':'Sem moedas disponíveis'} onClick={()=>submit('coin')}><span aria-hidden="true">🪙</span></button>
 <Button type="button" className="live-gift-button" variant="secondary" size="icon" aria-label="Abrir presentes" aria-haspopup="dialog" onClick={()=>{setFeedback('');setOpen(true)}}><GiftIcon/></Button>
 <Dialog open={open} onOpenChange={setOpen}><DialogContent fullScreen overlayClassName="gift-overlay" className="arcade-dialog gift-catalog"><div className="gift-sheet-header"><DialogTitle>Presentes </DialogTitle><DialogDescription className="sr-only">Envia um presente para {creator}. O envio de presentes estará disponível em breve.</DialogDescription><div className="gift-balance"><Coins/><span>O teu saldo</span><strong>{balance} {balance===1?'moeda':'moedas'}</strong></div></div>
 <div className="gift-sheet-body"><div className="gift-grid" role="group" aria-label="Escolher presente">{GIFTS.map(g=><button type="button" key={g.id} className={`gift-tile ${g.id===selected?'selected':''} ${balance<g.cost?'unaffordable':''}`} aria-pressed={g.id===selected} aria-label={`${g.name}, ${g.cost} ${g.cost===1?'moeda':'moedas'}`} onClick={()=>{setSelected(g.id);setFeedback('')}}><span className="gift-art" aria-hidden="true">{g.icon}</span><strong>{g.name}</strong><small><Coins/>{g.cost.toLocaleString('pt-PT')}</small>{g.id===selected&&<Check className="gift-check"/>}</button>)}</div><p className="gift-footnote">O envio de presentes ainda não está disponível.</p></div>
 <div className="gift-sheet-footer"><div className="gift-checkout"><div><strong>{gift.name}</strong><small>💎 {gift.cost.toLocaleString('pt-PT')} para o streamer</small></div><Button disabled onClick={()=>submit(gift.id)}>{sending?'A enviar…':`Enviar · ${gift.cost} ${gift.cost===1?'moeda':'moedas'}`}</Button></div>
 {balance<gift.cost&&<p className="gift-error">Saldo insuficiente para este presente. Os carregamentos ainda não estão disponíveis.</p>}{feedback&&<p role="status" className="gift-feedback">{feedback}</p>}</div>
 </DialogContent></Dialog></>
}
