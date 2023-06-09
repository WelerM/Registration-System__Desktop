const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Datastore = require('nedb');

const db = new Datastore({ filename: './path/to/db.db' });
db.loadDatabase();


//=======================================================================
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.setMenu(null)
  win.webContents.openDevTools()
  win.maximize();


  // =========== REGISTRATION INTERFACE =========//
  //Obj coming from registration form
  ipcMain.on('insert_data', (event, data) => {
    db.insert(data)
  })

  //Reassing of guests
  ipcMain.on('reassign_guest', (event, data) => {
    db.insert(data)
  })



  // ============ SEARCH INTERFACE =============//
  //QUICK SEARCH
  //By name
  ipcMain.on('search_by_name', (event, data) => {
    function search_by_name() {
      const obj = data
      const name = obj.name
      obj.name = new RegExp(name)
      db.find(obj, (err, data) => {
        if (data) {
          win.webContents.send("search_by_name_return", data)
        }
      })
    }
    search_by_name()
  })

  //By doc
  ipcMain.on('search_by_doc', (event, data) => {
    function search_by_doc() {
      const obj = data
      const documento = obj.document
      obj.document = new RegExp(documento)
      db.find(obj, (err, data) => {
        if (data) {
          win.webContents.send("search_by_doc_return", data)
        }
      })
    }
    search_by_doc()
  })


  //SEARCH BY MONTH
  ipcMain.on('search_by_month', async (event, data) => {
    db.find({ month: data }, (err, data) => {
      win.webContents.send('search_by_month_return', data)
    })
  })




  // ========= STATISTICS =============//
  //Today entries
  ipcMain.on('today_entries_call', (event, dat) => {
    const obj = dat
    const date = obj.date
    obj.date = new RegExp(date)

    db.find(obj, (err, data) => {
      win.webContents.send('today_entries_return', data)
    });
  })

  //Month entries
  ipcMain.on('month_entries_call', (event, data) => {
    function month_entries_return() {
      const obj = data
      const mes = obj.month
      obj.month = new RegExp(mes)
      db.find(obj.mes, (err, data) => {
        win.webContents.send('month_entries_return', data)
      });
    }
    month_entries_return()
  })

  //All entries
  ipcMain.on('all_data_call', (event, data) => {
    function all_data_return() {
      db.find({}, (err, data) => {
        win.webContents.send('all_data_return', data)
      });
    }
    all_data_return()
  })




  // - not finished
  //Posts interface
  ipcMain.on('insert_posts', (event, data) => {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
    const date_time = new Date();
    const day = date_time.getDate()
    const month = date_time.getMonth()
    const month_edited = date_time.getMonth() + 1
    const year = date_time.getFullYear()
    const full_date = `${day}/${month_edited}/${year}`

    const date = full_date
    const title = data.title
    const header_text = `Porto alegre, ${day} de ${months[month]} de ${year}`
    const text = data.text

    const obj = {
      date: date,
      title: title,
      header_text: header_text,
      text: text
    }

    db_posts.insert(obj)
  })


  ipcMain.on('get_posts', (event, data) => {
    db_posts.find({}, (err, data) => {
      win.webContents.send("return_posts", data)
    })
  })

  var db_posts = new Datastore({ filename: './path/to/db_posts.db' });
  db_posts.loadDatabase();

  //Desconsiderar os primeiros parâmetros das funções ( 'call_posts_index' e 'posts_index' )
  //Função acionada acionada pelo 'frontend', ( call_posts_index() )
  ipcMain.on('call_posts_index', (event, data) => {
    db_posts.find({}, (err, data) => {
      //Manda os dados do banco de dados para o 'frontend'
      win.webContents.send("posts_index", data)
    })
  })



  //===========================================//


  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})

