export function debounce(func, delay) {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

export function formatDate(date, fmt) {
    // 1.获取年份
    // y+   =>  1个或者多个y
    // y*   =>  0个或者多个y
    // y?   =>  0个或者1个y
    // yyy-MM-dd
    if (/(y+)/.test(fmt)) {
        // fmt = fmt.替换('yyyy', ('2021').截取字符(4 - yyyy.length));
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    // 2.获取
    let o = {
        // 得到的月份是0~11
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    };
    for (let k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
            let str = o[k] + '';
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
        }
    }
    return fmt;
};

// str=09 》0009 》 截取str的长度2 》 09
// str=9 》009 》 截取str的长度1 》 09
function padLeftZero(str) {
    return ('00' + str).substr(str.length);
}