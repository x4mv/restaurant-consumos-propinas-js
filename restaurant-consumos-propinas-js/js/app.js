// variables
const mesaInput = document.querySelector('#mesa');
const horaInput = document.querySelector('#hora');
const platillosView = document.querySelector('#platillos .contenido')
platillosView.classList.add('text-center')
const crearOrdenBtn = document.querySelector('#guardar-cliente');
const modalFormulario = document.querySelector('#formulario')
const resumenView = document.querySelector('#resumen .contenido')
// creando un objeto para almacenar las mesas
let subTotal;
let cliente = {
    mesa: '',
    hora: '',
    pedidos: []

}

const categorias = {
    1: 'Comida', 
    2: 'Bebida',
    3: 'Postres'
}

// eventlisteners 
document.addEventListener('DOMContentLoaded', () => {

    crearOrdenBtn.addEventListener('click', guardarOrden);

})

// funciones 

function guardarOrden(e){
    e.preventDefault()

    const mesa = mesaInput.value;
    const hora = horaInput.value;

    // validando campos 
    if ( mesa === '' || hora === ''){
        mostrarAlerta('No se pueden dejar campos vacios', 'error', mesaInput.parentElement.parentElement)
        return;
    }


    // asignando los datos del formulario al cliente
    cliente = {...cliente, mesa, hora};

    //ocultar modal al completar el form
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario)
    modalBootstrap.hide()

    // mostrar secciones ocultas
    mostrarSecciones()
    
    mostrarAlerta('Creando orden', '', mesaInput.parentElement.parentElement);
    
    creandoPlatillo()

    

}


function creandoPlatillo(){
    
    const url = 'http://localhost:3000/platillos';

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(data => {
            
            mostrandoPlatillos(data);

            
        })
}



function mostrandoPlatillos(listaPlatillos){

    listaPlatillos.forEach(platillo => {
        const {id , nombre, precio, categoria} = platillo
        const divContainer = document.createElement('DIV');
        divContainer.classList.add('container')

        const row = document.createElement('DIV');
        row.classList.add('row', 'border' , 'solid', '1px', 'my-2','text-center', 'p-4')
        
        const nombrePlatillo = document.createElement('p');
        nombrePlatillo.classList.add('col')
        nombrePlatillo.textContent = nombre

        const precioPlatillo = document.createElement('p');
        precioPlatillo.classList.add('col')
        precioPlatillo.textContent = precio

        const categoriaPlatillo = document.createElement('p');
        categoriaPlatillo.classList.add('col')
        categoriaPlatillo.textContent = categorias[categoria]

        const cantidadPlatillo = document.createElement('input');
        cantidadPlatillo.classList.add('col', 'form-control')
        cantidadPlatillo.type = 'number';
        cantidadPlatillo.min = 0;
        cantidadPlatillo.value = 0;
        cantidadPlatillo.id = `producto-${id}`

        //funcion para guardar cantidades seleccionadas
        cantidadPlatillo.onchange = () => {
            let cantidadNro = Number(cantidadPlatillo.value)
            agregarPlatillo({...platillo, cantidadNro})
        } 

        row.appendChild(nombrePlatillo)
        row.appendChild(precioPlatillo)
        row.appendChild(categoriaPlatillo)
        row.appendChild(cantidadPlatillo)


        divContainer.appendChild(row)
        platillosView.appendChild(divContainer)
        
        
    });

    
}

function agregarPlatillo(objetoProducto){
    const { cantidadNro } = objetoProducto;
    let { pedidos } = cliente

    if (cantidadNro > 0){
        
        // comprobar si un producto ya existe en la canasta 
        let existePedido =  pedidos.some(articulo => articulo.id === objetoProducto.id);
        if ( existePedido){
            // el articulo existe, act la cantidad
            const pedidoActualizado = pedidos.map( articulo => {
                if (articulo.id === objetoProducto.id){
                    articulo.cantidadNro = objetoProducto.cantidadNro ;

                }
                return articulo;
                
            })
            cliente.pedidos = [...pedidoActualizado]
        }else{
            // el articulo no existe y se agg a la canasta
            cliente.pedidos = [...pedidos, objetoProducto];
        }


    }else{
        // eliminar el articulo de la lista 
        const resultado = pedidos.filter( articulo => articulo.id !== objetoProducto.id);
        cliente.pedidos = [...resultado];
    }
    

    mostrarResumen();

    
    
}

function mostrarResumen(){
    
    
    if ( cliente.pedidos.length === 0){
        mensajeCanastaVacia();
        return;
    }
    

    limpiarHTML(resumenView);

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card' , 'py-5', 'px-3', 'shadow');

    // informacion de la mesa 
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    // informacion de la hora 
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    //titulo de la seccion 
    const heading = document.createElement('h3');
    heading.textContent = 'Platillos consumidos';
    heading.classList.add('my-4', 'text-center');

    // iterar sobre los pedidos
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const {pedidos} = cliente;

    pedidos.forEach( articulo => {
        const { nombre, precio, cantidadNro, id} = articulo;

        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        // HTML nombre del producto
        const nombreEl = document.createElement('h4');
        nombreEl.classList.add('my-4');
        nombreEl.textContent = nombre;

        // HTML cantidad del producto
        const cantidadEl = document.createElement('P');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = `Cantidad: ${cantidadNro}`;

        // HTML precio del producto
        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = `precio: $${precio}`;

        // HTML subtotal del producto
        const subTotalEl = document.createElement('P');
        subTotalEl.classList.add('fw-bold');
        subTotalEl.textContent = `SubTotal: $${precio*cantidadNro}`;

        // HTML para eliminar el producto de la canasta
        const eliminarBtn = document.createElement('button');
        eliminarBtn.classList.add('btn', 'btn-danger');
        eliminarBtn.textContent = 'Eliminar producto';
        eliminarBtn.onclick = () => eliminarProducto(id);

        // Agregando a la lista los items

        lista.appendChild(nombreEl)
        lista.appendChild(cantidadEl)
        lista.appendChild(precioEl)
        lista.appendChild(subTotalEl)
        lista.appendChild(eliminarBtn)

        //agregando la lista al grupo

        grupo.appendChild(lista)
    })



    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan)


    //agregando a la vista resumen
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(heading)
    resumen.appendChild(grupo)

    resumenView.appendChild(resumen)

    mostrarPropinas();

    





}

function mostrarPropinas(){
    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('DIV');
    divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow');

    const heading = document.createElement('H3');
    heading.classList.add('my-4');
    heading.textContent = 'Propina';

    // Propina 10%
    const checkBox10 = document.createElement('INPUT');
    checkBox10.type = "radio";
    checkBox10.name = 'propina';
    checkBox10.value = "10";
    checkBox10.classList.add('form-check-input');
    checkBox10.onclick = calcularPropina;

    const checkLabel10 = document.createElement('LABEL');
    checkLabel10.textContent = '10%';
    checkLabel10.classList.add('form-check-label');

    const checkDiv10 = document.createElement('DIV');
    checkDiv10.classList.add('form-check');

    checkDiv10.appendChild(checkBox10);
    checkDiv10.appendChild(checkLabel10);

    // Propina 25%

    const checkBox25 = document.createElement('INPUT');
    checkBox25.type = "radio";
    checkBox25.name = 'propina';
    checkBox25.value = "25";
    checkBox25.classList.add('form-check-input');
    checkBox25.onclick = calcularPropina;

    const checkLabel25 = document.createElement('LABEL');
    checkLabel25.textContent = '25%';
    checkLabel25.classList.add('form-check-label');

    const checkDiv25 = document.createElement('DIV');
    checkDiv25.classList.add('form-check');

    checkDiv25.appendChild(checkBox25);
    checkDiv25.appendChild(checkLabel25);

    // Propina 50%
    const checkBox50 = document.createElement('INPUT');
    checkBox50.type = "radio";
    checkBox50.name = 'propina';
    checkBox50.value = "50";
    checkBox50.classList.add('form-check-input');
    checkBox50.onclick = calcularPropina;

    const checkLabel50 = document.createElement('LABEL');
    checkLabel50.textContent = '50%';
    checkLabel50.classList.add('form-check-label');

    const checkDiv50 = document.createElement('DIV');
    checkDiv50.classList.add('form-check');

    checkDiv50.appendChild(checkBox50);
    checkDiv50.appendChild(checkLabel50);

    // Añadirlos a los formularios


    divFormulario.appendChild(heading);

    divFormulario.appendChild(checkDiv10);
    divFormulario.appendChild(checkDiv25);
    divFormulario.appendChild(checkDiv50);

    formulario.appendChild(divFormulario);

    resumenView.appendChild(formulario);
}


// calcula la propina de acuerdo al valor del input seleccionado
function calcularPropina(){
    
    const { pedidos } = cliente;
    subTotal = 0;

    //calcular el subtotal al pagar
    pedidos.forEach( articulo => {
        subTotal += articulo.cantidadNro * articulo.precio
    })

    const propinaSeleccionada = document.querySelector('[name="propina"]:checked');

    const total =  subTotal +  ((parseInt(propinaSeleccionada.value) * subTotal)/100);
    
    mostrarTotal(total, subTotal, propinaSeleccionada.value)

}

function mostrarTotal(total, subtotal, propina){

    const formulario = document.querySelector('.formulario > div');

    const divBalances = document.createElement('DIV');
    divBalances.classList.add('total-pagar');

    const contenedorBalance = document.createElement('DIV');
    divBalances.classList.add('contenedor-balances');

    
    //subtotal
    const subTotalParrafo = document.createElement('P');
    subTotalParrafo.classList.add('fs-3', 'fw-bold', 'mt-5');
    subTotalParrafo.textContent = 'SubTotal: ';

    const subTotalSpan = document.createElement('SPAN');
    subTotalSpan.classList.add('fw-normal');
    subTotalSpan.textContent = `$${subtotal}`;

    //propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-3', 'fw-bold', 'mt-5');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;

    //total
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-3', 'fw-bold', 'mt-5');
    totalParrafo.textContent = 'Total: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    

    // agregando spans a sus parrafos
    subTotalParrafo.appendChild(subTotalSpan)
    propinaParrafo.appendChild(propinaSpan);
    totalParrafo.appendChild(totalSpan);

    
    // agregando el parrafo al contenedor de balances 
    divBalances.appendChild(subTotalParrafo);
    divBalances.appendChild(propinaParrafo);
    divBalances.appendChild(totalParrafo);

    contenedorBalance.appendChild(divBalances)

    //eliminar el ultimo resultado
    const totalDiv = document.querySelector('.total-pagar');
    if (totalDiv){
        totalDiv.remove()
    }


    //agregando el div a la vista 
    formulario.appendChild(contenedorBalance)





}

function eliminarProducto(id){
    const resultado = cliente.pedidos.filter( articulo => articulo.id !== id )
    
    cliente.pedidos = [...resultado] 
    
    mostrarResumen()

    // reseteando el formulario para que vuelva a cero 
    const pedido = document.querySelector(`#producto-${id}`);
    pedido.value = 0;
}

function mostrarAlerta(mensaje, tipo,referencia){

    const alerta = document.querySelector('.alert');

    if (!alerta){

        const divAlerta = document.createElement('DIV');
        divAlerta.classList.add('alert', 'text-center');

        if (tipo === 'error'){
            divAlerta.classList.add('alert-danger');
        }else{
            divAlerta.classList.add('alert-success');
        }

        divAlerta.textContent = mensaje

        referencia.appendChild(divAlerta);

        setTimeout(() => {
            divAlerta.remove()
        }, 3000);

    }

}

function limpiarHTML(ref){

    while(ref.firstChild){
        ref.removeChild(ref.firstChild)
    }

    
}

function mostrarSecciones(){

    const seccionesOcultas = document.querySelectorAll('.d-none') 
    seccionesOcultas.forEach(seccion => {
        seccion.classList.remove('d-none')
    })
}

function mensajeCanastaVacia (){
    limpiarHTML(resumenView);
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('p');
    texto.classList.add('text-center');
    texto.textContent = `Añade pedidos a la canasta`;

    contenido.appendChild(texto)
}