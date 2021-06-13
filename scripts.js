// Abre e fecha o Modal
const Modal = {
    open(){
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}
// ARmazenamennto Local
const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finaces:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finaces:transactions", JSON.stringify(transactions))
    }
}
// Guarda adiciona e remove dados
const Transaction = {
    all: Storage.get(),
    add(transaction){
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },
    incomes(){
        let income = 0
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0){
                income += transaction.amount
            }
        })
        return income
    },
    expenses(){
        let expense = 0
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0){
                expense += transaction.amount
            }
        })
        return expense
    },
    total(){
        return Transaction.incomes() + Transaction.expenses()
    }
}
// Substitui/Adiciona elementos no DOM
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0? "income":"expense"
        
        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Reamover Transação"></td>
    
        `
        return html
    },
    updateBalance(){
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}
// Formatações de moeda ex: -R$ 7.000,00
const Utils = {
    formatAmount(value){
        value = Number(value) * 100
        
        return value
    },
    formatDate(date){
        const splitedDate = date.split("-")
        
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
    },
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, "")
        value = Number(value) /100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }
}
// Recebe os dados do formulario
const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateFields(){
        const { description, amount, date} = Form.getValues()
        
        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
                throw new Error("Por favor, peencha todos os campos.")
            }
    },
    formatValues(){
        let {description ,amount , date} = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        return {
            description,
            amount,
            date
        }
    },
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event){
        event.preventDefault()
        
        //tente
        try{
            //verifica se os campos estão validos
            Form.validateFields()
            // pegar uma transação formatada
            const transaction = Form.formatValues()
            //adicionar uma ttransação
            Transaction.add(transaction)
            //apagar
            Form.clearFields()
            //modal feche
            Modal.close()
        } catch(error){
            alert(error.message)
        }
    }
}
// Inicia e reinicia quando dados sao alterados
const App = {
    init(){
        Transaction.all.forEach(DOM.addTransaction)
        DOM.updateBalance()
        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    }
}
// Chama a função App.init()
App.init()
