import { GithubUser } from "./githubUser.js"

// Classe que vai conter a lógica dos dados 
// Como os dados serão estruturados
export class Favorites{
    constructor(root){
        this.root=document.querySelector(root)
        this.load()
    }
    
    load(){
        this.user = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    save(){
        localStorage.setItem('@github-favorites:', JSON.stringify(this.user))
    }

    async add(username){
        try {
            console.log('assincrona')
            const userExists = this.user.find(entry => entry.login.toLowerCase() === username.toLowerCase())
            
            if (userExists) return
            
            const user = await GithubUser.search(username)

            if(user.login === undefined){
                throw new Error('Usuário não encontrado!')
            }
            
            this.user = [user, ...this.user]
            this.update() 
            this.save()
        
        } catch (error) {
            alert(error.message)
        }
        
    }


    delete(user){
        // Se os dados forem diferentes dos dados da fila q vc clicou, ele adiciona à nova lista.
        // Se os dados forem iguais(FALSO), ele remove.

        const filterUser=this.user.filter(entry => entry.login !== user.login) 
        this.user = filterUser
        this.update()
        this.save()
    }
}

// Classe que vai crar a visualização do HTML
// eventos
export class FavoritesView extends Favorites{
    
    constructor(root){
        super(root)
        this.tbody=this.root.querySelector('table tbody')
        this.update()
        this.onadd()
    }


    onadd(){
        const addBtn = this.root.querySelector('.add-github-user button')
        addBtn.onclick = ()=>{
            const value= this.root.querySelector('.add-github-user input').value
            this.add(value)
        }
              
    }

    update(){
        
        this.removeAllTr()

        this.user.forEach(user => {
            const row = this.createRow()
            row.querySelector('.user img').src =`http://github.com/${user.login}.png`
            row.querySelector('.user img').alt =`Imagem de ${user.name}`
            row.querySelector('.user a').href =`http://github.com/${user.login}`
            row.querySelector('.user a p').textContent =user.name
            row.querySelector('.user a span').textContent =user.login
            row.querySelector('td:nth-child(2)').textContent =user.public_repos
            row.querySelector('td:nth-child(3)').textContent =user.followers

            this.tbody.append(row)

            row.querySelector('.icon-delete').onclick=()=>{
                const deleteConfirm = confirm('Tem certeza que deseja deletar a linha selecionada?')
                if (deleteConfirm){
                    this.delete(user)
                }
            }
        })
        this.isEmpty()
    }
    
    createRow(){
        const tr = document.createElement('tr')

        const rowData = `
                <td>
                    <div class="user flex align-center">
                        <div class="profile-image">
                            <img src="http://github.com/palomaselva.png" alt="Imagem do usuário">
                        </div>
                        <a href="http://github.com/palomaselva" target="_blank">
                            <p>Paloma Selva</p>
                            <span>palomaselva</span>
                        </a>
                    </div>
                </td>
                <td>02</td>
                <td>76</td>
                <td class="icon-delete">
                    <button>
                        <img src="./assets/delete.svg" alt="">
                    </button>
                </td>
        
        `

        tr.innerHTML=rowData
        return tr
    }

    isEmpty(){

        const isTableEmpty = this.user.length === 0

        if (isTableEmpty){

            const tr = document.createElement('tr')
            tr.classList.add('empty')
            const emptyTable = `
                <td colspan="4"> 
                    <div class="text-empty-table">
                        <img src="./assets/Estrela.png" alt="">
                        <h1>Nenhum favorito ainda</h1>
                    </div>
                </td>
            `
            tr.innerHTML=emptyTable
            this.tbody.append(tr)
        } 
    }

    removeAllTr(){
    
        this.tbody.querySelectorAll('tr')
        .forEach(
            (tr)=>{
                tr.remove()
            }
        )
    }

}