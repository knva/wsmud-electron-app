const { app, BrowserWindow, Tray, Menu, MenuItem, nativeImage, ipcMain } = require('electron')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const Store = require('electron-store')


const schedule = require('node-schedule')
const store = new Store()
let buttons = store.get('buttons') || []
let tasks = []


let mainWindow = null
let btnWindow = null
let scheduldWindow = null
let username = ''


function scheduleTask(id, cron, action) {
    schedule.scheduledJobs[id] = schedule.scheduleJob(cron, () => {
        console.log(`Executing task with id ${id}`)
        runScripts(action)
    })
}

const createScheduldWindow = () => {
    scheduldWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
        , icon: './images/icon.ico'
    })
    scheduldWindow.setIcon(logo)


    scheduldWindow.loadFile('cron.html')
    scheduldWindow.setMenu(null)

}
const createBtnWindow = () => {
    btnWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
        , icon: './images/icon.ico'
    })
    btnWindow.setIcon(logo)
    btnWindow.loadFile('sc.html')
    btnWindow.setMenu(null)


}
// modify your existing createWindow() function
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 750,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
        , icon: './images/icon.ico'
    })


    mainWindow.loadURL('http://mush.fun')
    // 在窗口关闭时将其设置为 null
    mainWindow.on('closed', () => {
        mainWindow = null
    })
    mainWindow.on('page-title-updated', (e, title, event) => {
        // 打印窗口标题
        console.log(title)
        mainWindow.setTitle(title)
        if (title.indexOf("-MUD") >= 0) {
            username = title.split("-")[0]
            tasks = store.get('tasks_' + username) || []
            for (let task in tasks) {
                const { id, name, cron, action } = tasks[task]
                console.log(`load task: ${name} ${cron} ${action}`)
                scheduleTask(id, cron, action)
            }
            tray.setTitle(username)
            tray.setToolTip(username)
        }
    });

}
function runScripts(input) {
    try {
        input = input.replace(/\n/g, "\r\n")
        if (input.split("\n")[0].indexOf("//") >= 0) {
            // ToRaid.perform($('#testmain').val());
            console.log(`ToRaid.perform(\`${input}\`)`)
            mainWindow.webContents.executeJavaScript(`ToRaid.perform(\`${input}\`)`)
        } else {
            mainWindow.webContents.executeJavaScript(`WG.SendCmd("${input}")`)
        }
    }
    catch (e) {
        console.log(e)
    }
}
function createInputWindow() {
    // 创建新的 BrowserWindow
    inputWindow = new BrowserWindow({
        width: 400,
        height: 400,
        webPreferences: {
            nodeIntegration: true
        },
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
        , icon: './images/icon.ico'
    })
    // 隐藏菜单
    inputWindow.setMenu(null)

    // 加载 HTML 页面
    inputWindow.loadFile(path.join(__dirname, 'input.html'))

    // 监听 submit 消息
    ipcMain.on('submit', (event, input) => {
        console.log(`user input : ${input}`)

        runScripts(input)
    })

    // 当窗口被关闭时，将 inputWindow 设置为 null
    inputWindow.on('closed', () => {
        inputWindow = null
    })
}

const menu = new Menu()
menu.append(new MenuItem({
    label: '脚本',
    submenu: [{
        role: 'run',
        label: '运行',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+R' : 'Alt+Shift+R',
        click: () => {

            createInputWindow()

        }
    }, {
        role: 'run',
        label: '按钮组',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+R' : 'Alt+Shift+R',
        click: () => {

            createBtnWindow()

        }
    }, {
        role: 'run',
        label: '定时任务',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+R' : 'Alt+Shift+R',
        click: () => {

            createScheduldWindow()

        }
    }, {
        role: 'toggledevtools',

    },
    ]
}))
// 在 macOS 上，单击 Dock 图标时重新创建主窗口
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})
Menu.setApplicationMenu(menu)
app.whenReady().then(() => {

    tray = new Tray('./images/icon.ico')
    tray.setToolTip('武神传说')
    tray.setTitle('武神传说')
    // 在 Tray 上添加右键菜单以显示或隐藏主窗口
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '显示 App',
            click: () => {
                mainWindow.show()
            }
        },
        {
            label: '隐藏 App',
            click: () => {
                mainWindow.hide()
            }
        },
        {
            label: '退出 App',
            click: () => {
                mainWindow.close()
            }
        }
    ])
    tray.setContextMenu(contextMenu)
    // 双击 Tray 时显示或隐藏主窗口
    tray.on('double-click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide()
        } else {
            mainWindow.show()
            app.quit()
        }
    })

    createWindow()
})
// 在 macOS 上，单击 Dock 图标时重新创建主窗口
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
    //遍历 schedule.scheduledJobs 全部停止
    for (let i in schedule.scheduledJobs) {
        schedule.scheduledJobs[i].cancel()
    }


    store.set('buttons', buttons)
    if (username != null) {
        store.set('tasks_' + username, tasks)
    }
})
app.whenReady().then(() => {

})



ipcMain.on('get-buttons', (event) => {
    event.reply('buttons', buttons)
})

ipcMain.on('add-button', (event, data) => {
    const { name, action } = data
    const id = uuidv4()
    buttons.push({ id, name, action })
    btnWindow.webContents.send('add-button', { id, name, action })
    store.set('buttons', buttons)
})

ipcMain.on('button-click', (event, data) => {
    const { id } = data
    const button = buttons.find(b => b.id === id)
    if (button) {
        console.log(`run:${button.action}`)
        runScripts(button.action)
    }
})

ipcMain.on('delete-button', (event, data) => {
    const { id } = data
    buttons = buttons.filter(b => b.id !== id)
    btnWindow.webContents.send('delete-button', { id })
    store.set('buttons', buttons)
})

ipcMain.on('edit-button', (event, data) => {
    const { id, name, action } = data
    const button = buttons.find(b => b.id === id)
    if (button) {
        button.name = name
        button.action = action
        btnWindow.webContents.send('edit-button', { id, name, action })
    }
    store.set('buttons', buttons)
})
// 在加载任务时，调用scheduleTask为每个任务创建定时器
ipcMain.on('load-tasks', (event) => {
    if (username != null) {
        tasks = store.get('tasks_' + username) || []
    }


    event.reply('tasks-loaded', tasks)
})

// 在添加任务时，也需要调用scheduleTask为新任务创建定时器
ipcMain.on('add-task', (event, task) => {
    const { name, cron, action } = task
    const id = uuidv4()
    //tasks append { id, name, cron, action }
    tasks.push({ id, name, cron, action })
    if (username != null) {
        store.set('tasks_' + username, tasks)
    }
    scheduleTask(id, cron, action)
    event.reply('task-added', { id, name, cron, action })
})

// 在删除任务时，需要取消对应的定时器
ipcMain.on('delete-task', (event, { id }) => {

    // 遍历tasks，找到对应的任务，删除
    tasks = tasks.filter(t => t.id !== id)

    if (username != null) {
        store.set('tasks_' + username, tasks)
    }
    const job = schedule.scheduledJobs[id]
    if (job) {
        job.cancel()
    }
    event.reply('task-deleted', { id })
})