'use strict';

//  Al cargar el documento se carga un captcha nuevo, se blanquean los campos y se carga la tabla.
document.addEventListener("DOMContentLoaded", function () {
    cargarTabla();
    blanquearCampos();
    cargarCaptcha();
});

//  Se crea una variable de tipo string para el captcha, ya que al ser un campo de texto está previsto que el usuario
//  ingrese letras.
const url = "http://web-unicen.herokuapp.com/api/groups/2-hernandezFLoberia/TPE3corador/";
let captcha = "";
let primeraCompra = false;
let recomendo = false;
let contadorRecomienda = 0;

/********************************************************************************************************************************
=== Tabla de personas para recomendar ===
********************************************************************************************************************************/

//  Botones para agregar y quitar elementos de la tabla.
let btnAgregarP = document.getElementById("btnAgregarP");
let btnAgregarTres = document.getElementById("btnAgregarTres");
let btnBorrarT = document.getElementById("btnBorrarT");

btnAgregarP.addEventListener("click", agregarPersona);
btnAgregarTres.addEventListener("click",agregarx3);
btnBorrarT.addEventListener("click", function(){
    let tabla = document.getElementById("tablaRecomienda");
    borrarTodas(tabla);
});


function cargarTabla() {
    
    // Hace un GET al JSON que está en el servidor
    fetch(url)
        .then(function(respuesta){
            if(respuesta.ok) {
                return respuesta.json();
            }
            else {
                alert("Ha ocurrido un error al cargar la tabla. :(");
            }
        })

        //  Por cada objeto que encuentra, agrega una fila nueva pasando cada atributo por parámetro
        .then(function(JSON){
            // console.log(JSON);
            JSON.TPE3corador.forEach(function(A){
                agregarFila(
                    A.thing.nombre,
                    A.thing.apellido,
                    A.thing.email,
                    A._id);
            })
        })

}

function agregarPersona() {

    let campoAgregaPNombre = document.getElementById("campoAgregaPNombre");
    let campoAgregaPApellido = document.getElementById("campoAgregaPApellido");
    let campoAgregaPEmail = document.getElementById("campoAgregaPEmail");

    //  Verifica que el email sea válido y el nombre no sea nulo; si esto se cumple,
    //  actualiza el servidor y luego la tabla.
    if (validarNombre(campoAgregaPNombre.value)) {
        if (validarEmail(campoAgregaPEmail.value)) {

            // ====== PORCIÓN AJAX ====== //

            // Crea un objeto con los valores de la persona creada
            let personaNueva = {
                'thing': {
                    'nombre': campoAgregaPNombre.value,
                    'apellido': campoAgregaPApellido.value,
                    'email': campoAgregaPEmail.value
                }
            }

            // Escribe el objeto en el JSON del servidor
            fetch((url), {
                'method': 'POST',
                'headers': {
                    'content-type': 'application/JSON'
                },
                'mode': 'cors',
                'body': JSON.stringify(personaNueva)
            })
                .then(function (respuesta) {
                    if (respuesta.ok) {
                        // console.log(respuesta);
                        return respuesta.json();
                    }
                    else {
                        alert("La solicitud al servidor falló.");
                    }
                })
                .then(function (JSON) {
                    // Una vez creado el objeto, lo agrega a la tabla.
                    agregarFila(
                        JSON.information.thing.nombre,
                        JSON.information.thing.apellido,
                        JSON.information.thing.email,
                        JSON.information._id);
                })

            // ======== FIN AJAX ======== //

            //  Suma a un contador de "recomendaciones del usuario".
            contadorRecomienda++;
            if (contadorRecomienda === 5) {
                recomendo = true;
            }
        }
    }

}

function agregarx3() {
    // Originalmente había intentado deshabilitar la función de alerta temporalmente,
    // por si el nombre y el email no eran válidos, para que no me mostrara 3 alertas seguidas.
    // Y lo había conseguido, pero al final lo hice de esta manera así no entra al for de manera innecesaria.

    let nombre = document.getElementById("campoAgregaPNombre");
    let email = document.getElementById("campoAgregaPEmail");
    
    if(validarNombre(nombre.value)) {
        if(validarEmail(email.value)) {

            for(let x = 0; x < 3; x++) {
                agregarPersona();
            }

        }
    }
}

function agregarFila(nom, ape, eml, id) {
    //  Agrega una fila a la tabla con los datos de la última persona en el JSON del servidor.

    let tabla = document.getElementById("tablaRecomienda");
    let btnEditar = document.createElement("button");
    let btnBorrar = document.createElement("button");
    btnEditar.innerHTML = "Editar";
    btnBorrar.innerHTML = "Borrar";

    //  Crea una nueva fila en la tabla con 3 columnas.
    let fila = tabla.insertRow(-1);
    let colNombre = fila.insertCell(0);
    let colApellido = fila.insertCell(1);
    let colEMail = fila.insertCell(2);
    let colEditar = fila.insertCell(3);
    let colBorrar = fila.insertCell(4);
    colEditar.appendChild(btnEditar); // Por esto no me dejaba agregar los botones; tenía que usar esto y no innerHTML
    colBorrar.appendChild(btnBorrar);

    btnBorrar.addEventListener("click",function(){
        borrarPersona(tabla,fila,id);
    });

    btnEditar.addEventListener("click",function(){
        editarPersona(colNombre,colApellido,colEMail,colEditar,colBorrar,btnEditar,btnBorrar,id);
    })

    //  Agrega el objeto al JSON de las personas dentro del servidor.
    //  Llena cada celda de la nueva fila con los campos del último objeto en el JSON.
    colNombre.innerHTML = nom;
    colApellido.innerHTML = ape;
    colEMail.innerHTML = eml;

}

function borrarPersona(tabla,fila,id) {

    // === PORCIÓN AJAX === //

    fetch((url+id),{
        'method':'DELETE'
    })
    .then(function(respuesta){
        if(respuesta.ok) {
            tabla.removeChild(fila);
            // Anteriormente había probado con deleteRow(fila) y hacía estas dos cosas:
                // borraba la primera fila en lugar de la que yo quería
                // borraba un solo elemento a la vez del servidor sin importar cuántos borrara de la tabla
        }
        else {
            alert("La fila no se pudo borrar.");
        }
    });

    // Al final toda la función fue AJAX :P
}

function borrarTodas(tabla) {
    //  Usa un bucle for con la longitud del JSON para borrar continuamente la última fila hasta que no queden más filas.

    fetch(url)
        .then(function(respuesta){
            if(respuesta.ok) {
                return respuesta.json();
            }
            else {
                alert("No se puede acceder al servidor.");
            }
        })

        .then(function(JSON){
            JSON.TPE3corador.forEach(function(A){
                fetch((url+(A._id)),{
                    'method':'DELETE'
                })
                .then(function(respuesta){
                    if(respuesta.ok) {
                        tabla.deleteRow(0);
                    }
                    else {
                        alert("No se pudieron borrar los datos.");
                    }
                }
            );
        });
    });

    // SÍIIIII FUNCIONÓOOOOOOOOO
    // Y fue más simple de lo que esperaba :D

}

function editarPersona(colNombre,colApellido,colEMail,colEditar,colBorrar,btnEditar,btnBorrar,id) {
    let valoresAnteriores =
        {
            'nombre': colNombre.textContent,
            'apellido': colApellido.textContent,
            'email': colEMail.textContent
        };

    //  Crea inputs para reemplazar las celdas.
    //  Los inputs toman los valores anteriores para que el usuario no los pierda
    //  si tiene mala memoria a corto plazo. :P
        let inEditarNombre = document.createElement("input");
        inEditarNombre.setAttribute('id','inputNombre');
        colNombre.innerHTML = "";
        colNombre.appendChild(inEditarNombre)
        inEditarNombre.value = valoresAnteriores.nombre;
        
        let inEditarApellido = document.createElement("input");
        inEditarApellido.setAttribute('id','inputApellido');
        colApellido.innerHTML = "";
        colApellido.appendChild(inEditarApellido);
        inEditarApellido.value = valoresAnteriores.apellido;

        let inEditarEMail = document.createElement("input");
        inEditarEMail.setAttribute('id','inputEMail');
        colEMail.innerHTML = "";
        colEMail.appendChild(inEditarEMail);
        inEditarEMail.value = valoresAnteriores.email;

    // Crea nuevos botones
        let btnOK = document.createElement("button");
        btnOK.innerHTML = "OK";
        let btnCancelar = document.createElement("button");
        btnCancelar.innerHTML = "Cancelar";
        
    // Borra los botones anteriores para mostrar los nuevos
        colEditar.removeChild(btnEditar);
        colEditar.appendChild(btnOK);
        colBorrar.removeChild(btnBorrar);
        colBorrar.appendChild(btnCancelar);

        btnOK.addEventListener("click",function(){

            if ((validarNombre(inEditarNombre.value)) && (validarEmail(inEditarEMail.value))) {
                
                if( // Este if hace que el botón OK sólo ejecute el fetch
                    // si alguno de los valores en los campos es distinto del anterior,
                    // y si el nombre y el email son válidos.
                    (inEditarNombre.value != valoresAnteriores.nombre)
                    ||
                    (inEditarApellido.value != valoresAnteriores.apellido)
                    ||
                    (inEditarEMail.value != valoresAnteriores.email)
                ){

                    // Crea un objeto con los datos actualizados:
                    let personaEditada = {
                        'thing': {
                            'nombre':inEditarNombre.value,
                            'apellido':inEditarApellido.value,
                            'email':inEditarEMail.value
                        }
                    }
                    // Modifica los datos actualizados del ID específico usando los valores del nuevo objeto:

                    
                    fetch((url+id),{
                        'method':'PUT',
                        'mode': 'cors',
                        'headers': {
                            'content-type': 'application/JSON'
                        },
                        'body': JSON.stringify(personaEditada)
                    })
                    .then(function(respuesta){
                        if(respuesta.ok) {
                            colNombre.innerHTML = "";
                            colNombre.innerHTML = personaEditada.thing.nombre;
                            colApellido.innerHTML = "";
                            colApellido.innerHTML = personaEditada.thing.apellido;
                            colEMail.innerHTML = "";
                            colEMail.innerHTML = personaEditada.thing.email;
                            return respuesta.json();
                        }
                        else {
                            alert("No se pudo editar la persona.");
                        }
                    })
                    .then(function(JSON){

                    });

                    colEditar.removeChild(btnOK);
                    colEditar.appendChild(btnEditar);
                    colBorrar.removeChild(btnCancelar);
                    colBorrar.appendChild(btnBorrar);
                
                }

            }

        })

        btnCancelar.addEventListener("click",function(){
            
            // Cancela la edición y vuelve todo a como estaba:
            
            // 1. Vuelve a reemplazar los botones
                colEditar.removeChild(btnOK);
                colEditar.appendChild(btnEditar);
                colBorrar.removeChild(btnCancelar);
                colBorrar.appendChild(btnBorrar);

            // 2. Devuelve los valores anteriores a las columnas
                colNombre.innerHTML = valoresAnteriores.nombre;
                colApellido.innerHTML = valoresAnteriores.apellido;
                colEMail.innerHTML = valoresAnteriores.email;
        });

}

/********************************************************************************************************************************
===<>===<>=== FILTRO DE BÚSQUEDA ===<>===<>===
********************************************************************************************************************************/

let btnBuscarNom = document.getElementById("buscarPNom");
let btnBuscarApe = document.getElementById("buscarPApe");
let btnBuscarEml = document.getElementById("buscarPEml");

// función anónima para buscar por nombre
btnBuscarNom.addEventListener("click",function(){
    buscarEnTabla(0);
});
btnBuscarApe.addEventListener("click",function(){
    buscarEnTabla(1);
})
btnBuscarEml.addEventListener("click",function(){
    buscarEnTabla(2);
})

function buscarEnTabla(indiceCol) {

    let tFilas = document.querySelectorAll("tr");
    let busqueda = ((document.getElementById("campoBusqueda")).value).toLowerCase();
    let encontrado = false;

    for(let i = 1; i < tFilas.length; i++) {

        let celda = (tFilas[i].cells[indiceCol]);
        if((celda.textContent).toLowerCase() === busqueda) {

            // Si encuentra un nuevo resultado, por nombre, apellido o email,
            // remueve la clase "resaltado" de todas las celdas en las otras columnas.
            for(let j = 1; j < tFilas.length; j++) {
                for(let k = 0; k < 3; k++) {
                    if((k != indiceCol) || ((k === indiceCol) && (tFilas[j].cells[k].textContent != busqueda))) {
                        tFilas[j].cells[k].classList.remove("resaltado");
                    }
                }
            }
            celda.classList.add("resaltado");
            encontrado = true;
            // console.log(celda);
        }

    }
    
    if(!encontrado) {

        alert("No se encontraron coincidencias.");
        resetearClasesCeldas(tFilas);
        // Al no encontrar nada, remueve la clase "resaltado" de todas las celdas que la tengan.

    }

}

function resetearClasesCeldas(tablaFilas) {
    
    for(let i = 1; i < tablaFilas.length; i++) {
        for(let j = 0; j < 3; j++) {
            tablaFilas[i].cells[j].classList.remove("resaltado");
        }
    }

}

/********************************************************************************************************************************
=== Verificación de compra normal ===
********************************************************************************************************************************/


function blanquearCampos() {

    //  Los campos se inicializan dentro de esta función para no ocupar memoria de manera innecesaria con variables globales.

    let formCaptcha = document.getElementById("campoCaptcha");
    formCaptcha.value = "";

    let formEMail = document.getElementById("campoEMail");
    formEMail.value = "";

    // (AGREGADO después de exponer)

    let formRecomNombre = document.getElementById("campoAgregaPNombre");
    formRecomNombre.value = "";

    let formRecomApellido = document.getElementById("campoAgregaPApellido");
    formRecomApellido.value = "";

    let formRecomEMail = document.getElementById("campoAgregaPEmail");
    formRecomEMail.value = "";

    let formRecomBuscar = document.getElementById("campoBusqueda");
    formRecomBuscar.value = "";

    //

}

//  Se inicializa el botón para cambiar de captcha en cualquier momento.
let btnCaptcha = document.getElementById("btnCambioCaptcha");
btnCaptcha.addEventListener("click", function () {

    //  Reproduce un sonido cuando se aprieta el botón.
    let ding = document.getElementById("utopiaDing");

    if (!ding.paused) {
        //  Si el sonido ya se está reproduciendo, salta al inicio para "volver a reproducir".
        ding.currentTime = 0;
    }
    else {
        ding.play();
    }

    cargarCaptcha();

});

function cargarCaptcha() {

    //  Se muestra un captcha a partir de un número generado aleatoriamente del 1 al 5,
    //  cambiando el atributo src de la imagen en el HTML con el ID "imgCaptcha".

    let opcion = (Math.floor(Math.random() * 5) + 1);

    switch (opcion) {

        case 1:
            document.getElementById("imgCaptcha").src = "images/captcha1.png";
            captcha = 72581;
            break;

        case 2:
            document.getElementById("imgCaptcha").src = "images/captcha2.png";
            captcha = 68473;
            break;

        case 3:
            document.getElementById("imgCaptcha").src = "images/captcha3.png";
            captcha = 23591;
            break;

        case 4:
            document.getElementById("imgCaptcha").src = "images/captcha4.png";
            captcha = 48639;
            break;

        case 5:
            document.getElementById("imgCaptcha").src = "images/captcha5.png";
            captcha = 78265;
            break;

    }
}

let btn = document.getElementById("confirmaCompra"); // Reconoce el botón
btn.addEventListener("click", verificarCompra); // Al clickear el botón se verifica el valor del formulario

//  Validación del formulario de compra normal (con EMail y captcha).
function verificarCompra() {

    let formCaptcha = document.getElementById("campoCaptcha");
    let formEMail = document.getElementById("campoEMail");

    //  Mira el contenido del campo de texto y lo compara con el captcha fijo, y también verifica que la dirección de email sea válida.
    if ((formCaptcha.value != "") && (formEMail.value != "")) {

        //  Con este if anidado, el javascript tiene la posibilidad de mostrar un mensaje de error correspondiente a cada campo,
        //  dándole prioridad al email.
        if (validarEmail(formEMail.value)) {
            if (validarCaptcha(parseInt(formCaptcha.value))) {

                confirmadaCompra();
                if (!primeraCompra) {
                    primeraCompra = true;
                    if (recomendo) {
                        felicita();
                    }
                }

            }
        }

    }
    else if ((formCaptcha.value === "") || (formEMail.value === "")) {
        //  Error por defecto si el usuario dejó algún campo en blanco.
        errorCompra();
    }

}

//  Función que verifica si hay un nombre ingresado.
function validarNombre(nombre) {
    if (nombre != "") {
        return true;
    }
    else {
        alert("Los campos de Nombre y de EMail no deben quedar en blanco.");
        return false;
    }
}

//  Función que verifica que el e-mail ingresado en un campo de texto es una dirección válida.
function validarEmail(dirEMail) {

    if(dirEMail!=""){
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(dirEMail)) {
            return true;
        }
        else {
            alert("La dirección de e-mail ingresada no es válida.");
            return false;
        }
    }
    else {
        alert("Ingrese una dirección de e-mail.");
        return false;
    }
}

//  Verificación de captcha.
function validarCaptcha(numero) {

    //  La función recibe el resultado de un string parseado a int.
    //  Si el resultado es distinto de NaN, el número ingresado se puede comparar directamente con el int asociado al captcha.
    if (!Number.isNaN(numero)) {
        if (numero !== captcha) {
            alert("El captcha ingresado no es correcto.");
            return false;
        }
        else {
            return true;
        }
    }
    else {
        alert("Ingrese sólo números en el campo de captcha.");
        return false;
    }

}

//  Alerta de error de compra; al menos un campo en blanco.
function errorCompra() {
    alert("Por favor no deje campos en blanco.");
}

//  Confirmación de compra.
function confirmadaCompra() {
    alert("¡Felicitaciones!\nLa compra se ha realizado con éxito.");
}

//  Felicitación por el descuento por recomendación.
function felicita() {

    let sndCongrats = document.getElementById("congrats");
    sndCongrats.play();
    alert("¡Felicidades!\n¡Ha obtenido un 20% de descuento por recomendarnos!");

}