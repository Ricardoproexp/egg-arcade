import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {ProfileEditor} from './profile-editor';
import {defaults} from './store';
afterEach(cleanup);
it('validates uploads and only commits selected media on save',async()=>{
 const save=vi.fn();render(<ProfileEditor profile={defaults.profile} save={save}/>);
 fireEvent.change(screen.getByLabelText('Foto de perfil'),{target:{files:[new File(['bad'],'bad.txt',{type:'text/plain'})]}});
 expect(screen.getByRole('alert')).toHaveTextContent('JPEG, PNG ou WebP');
 fireEvent.change(screen.getByLabelText('Foto de perfil'),{target:{files:[new File(['photo'],'photo.png',{type:'image/png'})]}});
 await screen.findByAltText('Pré-visualização da foto');expect(save).not.toHaveBeenCalled();
 fireEvent.change(screen.getByLabelText('Fundo do perfil'),{target:{files:[new File(['banner'],'banner.webp',{type:'image/webp'})]}});
 await screen.findByAltText('Pré-visualização do fundo');
 await waitFor(()=>expect(screen.getByRole('button',{name:'Guardar perfil'})).not.toBeDisabled());
 fireEvent.click(screen.getByRole('button',{name:'Guardar perfil'}));
 expect(save).toHaveBeenCalledWith(expect.objectContaining({avatar:expect.stringMatching(/^data:image\/png;base64,/),banner:expect.stringMatching(/^data:image\/webp;base64,/)}));
});
it('shows a storage failure instead of pretending the profile was saved',()=>{
 render(<ProfileEditor profile={defaults.profile} save={()=>false}/>);fireEvent.click(screen.getByRole('button',{name:'Guardar perfil'}));expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível guardar');
});
