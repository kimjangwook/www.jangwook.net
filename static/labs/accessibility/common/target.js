const dialog=document.querySelector('#lab-dialog');
const trigger=document.querySelector('#lab-terms-trigger');
trigger?.addEventListener('click',event=>{if(!dialog?.showModal)return;event.preventDefault();if(dialog.open)dialog.close();dialog.showModal();});
dialog?.querySelector('[data-close-dialog]')?.addEventListener('click',event=>{if(!dialog.open)return;event.preventDefault();dialog.close();trigger?.focus();});
dialog?.addEventListener('close',()=>trigger?.focus());
const form=document.querySelector('#lab-registration');
form?.addEventListener('submit',event=>{
 event.preventDefault();const email=document.querySelector('#lab-email');
 if(!email?.value||!email.validity.valid){email?.setAttribute('aria-invalid','true');email?.setAttribute('aria-describedby','lab-email-help lab-email-error');document.querySelector('#lab-email-error').hidden=false;const summary=document.querySelector('#lab-error-summary');summary.hidden=false;summary.focus();return;}
 const next=new URL(location.href);next.searchParams.set('state','review');next.hash='lab-form';location.assign(next.href);
});
document.querySelector('#lab-email')?.addEventListener('input',event=>{if(event.target.validity.valid){event.target.removeAttribute('aria-invalid');event.target.setAttribute('aria-describedby','lab-email-help');document.querySelector('#lab-email-error').hidden=true;}});
