import {Wallet} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
export function WalletPanel({open,setOpen}:{open:boolean;setOpen:(value:boolean)=>void;coins:number;diamonds:number}){
 return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="arcade-dialog wallet-panel"><DialogTitle>A tua carteira</DialogTitle><DialogDescription>A carteira estará disponível em breve.</DialogDescription><div className="launch-empty"><Wallet/><h2>Um novo espaço para os teus ganhos</h2><p>Carregamentos, presentes e levantamentos ainda não estão disponíveis.</p><Button disabled>Disponível em breve</Button></div></DialogContent></Dialog>;
}
