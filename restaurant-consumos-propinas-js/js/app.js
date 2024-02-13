// variables
const mesaInput = document.querySelector('#mesa');
const horaInput = document.querySelector('#hora');
const platillosView = document.querySelector('#platillos .contenido')
platillosView.classList.add('text-center')
const crearOrdenBtn = document.querySelector('#guardar-cliente');
const modalFormulario = document.querySelector('#formulario')
const resumenView = document.querySelector('#resumen .contenido')
// creando un objeto para almacenar las mesas
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
    console.log(cliente.pedidos)

    mostrarResumen();
    
}

function mostrarResumen(){
    
    

    limpiarHTML(resumenView);

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6');

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
    heading.classList.add('my-4');



    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan)


    //agregando a la vista resumen
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(heading)

    resumenView.appendChild(resumen)





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
    if (ref){
        while(ref.firstChild){
            ref.removeChild(ref.firstChild)
        }

    }
    
}

function mostrarSecciones(){

    const seccionesOcultas = document.querySelectorAll('.d-none') 
    seccionesOcultas.forEach(seccion => {
        seccion.classList.remove('d-none')
    })
}