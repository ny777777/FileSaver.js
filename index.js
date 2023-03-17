/*
 * @Author         : Nuanyang jstynuanyang@itcom888.com
 * @Date           : 2022-12-28 13:19:12
 * @LastEditors    : Nuanyang jstynuanyang@itcom888.com
 * @LastEditTime   : 2023-03-15 19:02:09
 * @FilePath       : \1111.json\demo\utils\js\utils.js
 * @Description    : 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * @Description 导出文件
 * @param {Object} content  导出的数据
 * @param {String} flieName  导出的文件名称
 * @returns
 */
const import_json = (content, flieName = "text") => {
    const jsr = JSON.stringify(content);
    const blob = new Blob([jsr], { type: `application/json` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flieName}.json`;
    document.documentElement.appendChild(a)
    a.click()
    document.documentElement.removeChild(a)
}

/**
 * @Description 媒体类型转换
 * @param {String | Number} type   转换的类型 string => number | number => string |  number
 * @returns {String | Number} 媒体类型转换结果
 */
const get_media_icon_index = (type) => {
    const media_icons = [
        'video',
        'animation',
        'studio',
        'anchor',
        'topic',
    ]
    return media_icons[type - 1] || media_icons.indexOf(type) + 1 || 1
}


/**
 * @Description 并发请求限制
 */
class TaskQueue {
    constructor(max, task_list, callback) {
        this.max = max
        this.callback = callback
        this.init()
        this.addTask(task_list)
    }

    init() {
        this.task_list = []
        this.results = []
        this.task_num = 0
        this.done_num = 0
    }
    addTask(tasks) {
        // console.log(tasks);
        if (tasks instanceof Array) {
            tasks.forEach((task, index) => {
                let task_obj = { task, index }
                this.task_list.push(task_obj)
            });
            this.run()
        } else {
            // console.error('传入数组！！！！！！！！！！！！！！！！！！！！！！！');
        }
    }
    run() {
        let total = this.task_list.length
        this.task_num = total
        let min = Math.min(this.max, total)
        let task_list = this.task_list.splice(0, min)
        task_list.forEach((task_obj, index) => {
            this.run_task(task_obj)
        })
    }
    run_task(task_obj) {
        let { task, index } = task_obj
        task().then(res => {
            this.results[index] = res
        }).catch((err) => {
            this.results[index] = err
        }).finally(() => {
            this.done_num++;
            this.run_next_task();
            if (this.done_num === this.task_num && this.callback) {
                this.callback(this.results);
                this.init()
            }
        })
    }
    run_next_task() {
        if (this.task_list.length > 0) {
            let [task_obj] = this.task_list.splice(0, 1)
            this.run_task(task_obj)
        }
    }
}

class Traversal {
    constructor(key, value) {
        this.key = key
        this.value = value
    }
    // 深度优先遍历
    deep_traversal(obj) {
        const { value, key } = this
        // console.log(obj[value]);
        if (obj[key]) {
            obj[key].forEach(ele => {
                this.deep_traversal(ele)
            });
        }
    }
    // 广度优先遍历
    vast_traversal(arr, callback) {
        const { value, key } = this
        while (arr.length) {
            let temp = arr.shift()
            // console.log('object :>> ', temp[value]);
            if (temp[key]) {
                temp[key].forEach(ele => {
                    arr.push(ele)
                })
            }
        }
    }
    vast_traversal2(arr) {
        const { value, key } = this
        let temp = []
        arr.forEach(item => {
            console.log(item[value]);
            if (item[key]) {
                temp.push(...item[key])
            }
        })
        temp.length && this.vast_traversal2(temp)
    }
};

class ObServer {
    message = {}
    $on(key, callback) {
        let message = this.message[key]
        if (message) {
            message.push(callback)
        } else {
            this.message[key] = [callback]
        }
    }
    $emit(key, ...arg) {
        if (!this.message[key]) return
        this.message[key].forEach(callback => {
            callback(...arg)
        })
    }
    $off(key, callback) {
        if (!this.message[key]) return
        this.message[key].filter(item => callback != item)
    }
};

class Subscriber {
    constructor(name) {
        this.name = name
    }

    notice(msg) {
        console.log(`${this.name}收到：${msg}`);
    }

};

class Publish {
    constructor() {
        this.subscriberList = []
    }
    addSubscriber(subscriber) {
        this.subscriberList.push(subscriber)
        return this
    }
    publishMsg(msg) {
        this.subscriberList.forEach(subscriber => {
            subscriber.notice(msg)
        })
    }
};
/**
 * @Description 睡眠函数
 * @param {number} timer  睡眠时间
 * @returns {Promise}
 */

const sleep = (timer) => {
    return new Promise(resolve => {
        return setTimeout(() => resolve(2), timer)
    })
};
/**
 * @Description 路径转换
 * @param {string} path  路径
 * @returns {Array} 路径切割后的数组
 */
const basePath = (path) => {
    // 若是数组，则直接返回
    if (Array.isArray(path)) return path
    // 若有 '[',']'，则替换成将 '[' 替换成 '.',去掉 ']'
    return path.replace(/\[/g, '.').replace(/\]/g, '').split('.')
}
/**
 * @Description 设置目标元素属性
 * @param {Object} target  源对象
 * @param {String} path 路径
 * @param {any} value 设置的值
 */
const $set = (target, path, value) => {
    if (! typeof target == 'object') return target
    let paths = basePath(path)
    paths.reduce((pre, cur, i, arr) => {
        if (i === arr.length - 1) {
            pre[cur] = value
            return null
        } else if (pre[cur]) {
            return pre[cur]
        } else {
            pre[cur] = /^[0-9]{1,}$/.test(arr[i + 1]) ? [] : {}
            return pre[cur]
        }

    }, target)
}
/**
 * @Description 获取目标元素属性
 * @param {Object} target  源对象
 * @param {String} path 路径
 * @param {any} defaultValue 默认值
 * @returns {any} 目标元素属性
 */
const $get = (target, path, defaultValue) => {
    if (! typeof target == 'object') return defaultValue
    let paths = basePath(path)
    return paths.reduce((pre, cur) => (pre || {})[cur], target) || defaultValue
}


const tileData = (json, result, prefix) => {
    for (const key in json) {
        if (typeof json[key] !== 'object') {
            let cur_key = key
            if (prefix) {
                cur_key = prefix + key
            }
            result[cur_key] = json[key]
        } else {
            let cur_prefix = `${key}.`
            if (prefix) {
                cur_prefix = prefix + cur_prefix
            }
            tileData(json[key], result, cur_prefix)
        }
    }
}




export { import_json, get_media_icon_index, TaskQueue, Traversal, ObServer, Subscriber, Publish, sleep, $set, $get,tileData }
export default { import_json, get_media_icon_index, TaskQueue, Traversal, ObServer, Subscriber, Publish, sleep, $set, $get,tileData }