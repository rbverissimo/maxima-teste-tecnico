import { Component, OnInit } from '@angular/core';
import { CadastroService, OperacaoCadastro } from '../../cadastro.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Cliente } from 'src/app/modelos/cliente.model';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { UtilService } from 'src/app/utilitarios/util.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrosDialogComponent } from '../erros-dialog/erros-dialog.component';

@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.css']
})
export class EditarClienteComponent implements OnInit {

  listaErros = [];
  ocorreuErro: boolean = false;

  ehAlterar: boolean = false;

  mapsLoaded: Observable<boolean>;

  constructor(public cadastroService: CadastroService, 
    private router: Router, private route: ActivatedRoute, 
    private httpClient: HttpClient,
    private utilService: UtilService,
    public dialog: MatDialog){
      
      this.mapsLoaded = httpClient.jsonp('https://maps.googleapis.com/maps/api/js?key=AIzaSyDjOOmsUN7kOrfi1WtQkgJzX1HNzMMk9nU', 
      'callback')
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );

    }

    ngOnInit(): void {
      if(this.cadastroService.operacaoCadastro === OperacaoCadastro.ALTERAR){
        this.ehAlterar = true;
      }
    }

  onCancelarClick() {
    this.router.navigate(['cadastro']);
    this.cadastroService.entidade = new Cliente('', '');
  }

  refreshLista(){
    this.cadastroService.getClientesLista();
  }

  onSalvarClick(entidade: Cliente){
    this.cadastroService.salvar(this.cadastroService.operacaoCadastro, entidade).subscribe(
      data => {
        if(this.utilService.isErrosEncontrados(data)){
          this.ocorreuErro = true;
          this.openDialog();
        } else {
          this.adicionarClick();
          this.onCancelarClick();
        }
      }, 
      error => {
        console.error(error);
      }
    );
  }

  onExcluirClienteClick(codigo: number){
    this.cadastroService.exluir(codigo).subscribe(
      data => {
        this.onCancelarClick();
      }, error => { 
        console.error(error); 
      }
    )
  }

  adicionarClick(){
    this.cadastroService.entidade = new Cliente('', '');
  }

  openDialog(){
      this.dialog.open(ErrosDialogComponent, 
        {data: 
          { mensagem: "Erro ao salvar cliente. Confira se o endereço está correto"}});
  }
}
