const indexedDB = window.indexedDB  //se agrega el window porque la variable s ellama igual
const form = document.getElementById('form')
const tasks = document.getElementById('task')

if(indexedDB && form){
    let db //variable para almacenar base de datos
    const solicitud = indexedDB.open('lista-de-tareas', 1) // (nombre de DB, version de DB en numeros enteros)
    
    solicitud.onsuccess = () => { //cuando se abre
        db = solicitud.result
        console.log('OPEN', db)
        readData()
    }

    solicitud.onupgradeneeded = () => {//cuando se crea si no existe o cuando se modifica
        db = solicitud.result 
        console.log('CREATE', db) /*Cuando se crean registros, es necesario crear una clave y valor, con autoincrement se genera
        automáticamente*/ 
    //  const objectStore = db.createObjectStore('tareas',{autoIncrement:true}) // crea el almacen de datos
    // con keyPath se asigna un valor de clave a la ruta de claves
        const objectStore = db.createObjectStore('tareas',{keyPath:'tituloTarea'}) // crea el almacen de datos
    } 


    solicitud.onerror = (error) =>{ // algún error
        console.log('error', error)
    }

//funcion para agregar datos

    const addData = (datos) =>{ 
        const transaction = db.transaction(['tareas'], 'readwrite') // pasa los datos de tareas, puede ser R/W o Read only
        // una vez creada a transaction se abre el almacen de datos
        const objectStore = transaction.objectStore('tareas') //devuelve un objeto
        const solicitud = objectStore.add(datos)  //añade los datos
        readData()
  
    }


// funcion para actualizar datos

    const upData = (datos) =>{ 
        const transaction = db.transaction(['tareas'], 'readwrite') 
        const objectStore = transaction.objectStore('tareas') 
        const solicitud = objectStore.put(datos)  //.put si existe lo actualiza, si no, lo añade
        
        // se usa el metodo .onsuccess para que lo haga cuando terminó de actualizar los datos
        solicitud.onsuccess = () =>{
             form.button.dataset.action = 'add'
             form.button.textContent = 'Agregar Tarea'
             readData() 
        }   

      
    }
//Funcino para obtener las tareas de la DB
    const getData = (key) =>{
        const transaction = db.transaction(['tareas'], 'readonly')
        const objectStore = transaction.objectStore('tareas') 
        const solicitud = objectStore.get(key) 

        solicitud.onsuccess = () =>{
            form.task.value = solicitud.result.tituloTarea
            form.priority.value = solicitud.result.prioridadTarea
            form.button.dataset.action = 'update'
            form.button.textContent = 'Actualizar Tarea'
        }

    }


    //La funcion read Data se llama cuando la DB ya exista ( o sea en OPEN "mas arriba")


    const readData = () =>{ 
        const transaction = db.transaction(['tareas'], 'readonly') // pasa los datos de tareas, puede ser R/W o Read only
        // una vez creada a transaction se abre el almacen de datos
        const objectStore = transaction.objectStore('tareas') //devuelve un objeto
        const solicitud = objectStore.openCursor()  //recorre cada objeto y devuelve el valor
        const fragment =document.createDocumentFragment()
        
        solicitud.onsuccess = (e) =>{
            const cursor = e.target.result //guarda el resultado de la consulta
            
            if (cursor) {
                const titTarea = document.createElement('h2')
                titTarea.textContent = cursor.value.tituloTarea            
                
                const priTarea = document.createElement('p')
                priTarea.textContent = cursor.value.prioridadTarea

                const updateBtn = document.createElement('button')
                updateBtn.textContent= 'Actualizar'
                updateBtn.dataset.type = 'Update'  //para que sepa que es para borrar
                updateBtn.dataset.key = cursor.key  // este parametro se envía al botón del form para saber que elemento actualizar
                updateBtn.classList.add('btn-up')

                const delBtn = document.createElement('button')
                delBtn.textContent='Borrar'
                delBtn.dataset.type = 'delete'
                delBtn.dataset.key = cursor.key 
                delBtn.classList.add('btn-del')
                fragment.appendChild(titTarea)
                fragment.appendChild(priTarea)
                fragment.appendChild(updateBtn)
                fragment.appendChild(delBtn)
                

                cursor.continue()  //continua leyendo los datos porque cursor solo lee 1 vez
            }else { 
                task.textContent='' // para evitar que duplique las tareas
                task.append(fragment)}
        }
    }

    const delData = (key) =>{
        const transaction = db.transaction(['tareas'], 'readwrite') 
        const objectStore = transaction.objectStore('tareas')
        const solicitud = objectStore.delete(key)  //
        
        // se usa el metodo .onsuccess para que lo haga cuando terminó de actualizar los datos
        solicitud.onsuccess = () =>{
           
             readData() 
         }
        
        }


    form.addEventListener('submit', (e) =>{
        e.preventDefault()
        const datos = {        
            tituloTarea : e.target.task.value,
            prioridadTarea : e.target.priority.value 
        }    

        if (e.target.button.dataset.action == 'add') {
            if (!datos.tituloTarea=='')  {addData(datos)}
            else ( alert ('Debe Agregar una Tarea'))
        }else if (e.target.button.dataset.action == 'update'){
            upData(datos)
        } 
        form.reset()
    
    })

    tasks.addEventListener('click', (e) =>{
        //la seiguiente linea asegura de hacer click sobre el botón de update
        if (e.target.dataset .type == 'Update'){ 
        getData(e.target.dataset.key) 
        }
        else if (e.target.dataset.type == 'delete'){
        delData(e.target.dataset.key)
        }
      })

}