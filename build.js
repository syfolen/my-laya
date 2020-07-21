
const fs = require("fs");
const exec = require("child_process").execSync;

main();

function main() {
    const s0 = "bin\\js";
    const a = fs.readdirSync(s0);
    for (const s1 of a) {
        const s2 = s0 + "\\" + s1;
        const stat = fs.lstatSync(s2);
        if (stat.isDirectory() === true) {
            continue;
        }
        if (build(s1) === false) {
            continue;
        }
        const reg0 = s1.lastIndexOf(".js");
        const s3 = s1.substr(0, reg0);
        const s7 = `bin\\js\\${s3}.min.js`;
        const s10 = `release\\${s3}.js`;
        const s11 = `release\\${s3}.min.js`;
        const f = fs.createReadStream(s2);
        const g = fs.createWriteStream(s10);
        f.pipe(g);
        const h = fs.createReadStream(s7)
        const i = fs.createWriteStream(s11);
        h.pipe(i);
    }
}

function exportNotes(notes) {
    if (notes.length === 0) {
        return;
    }
    const lines = [];
    lines.push(`/**`);
    for (const note of notes) {
        lines.push(` * ${note}`);
    }
    lines.push(` */`);
    return lines.join("\r\n");
}

function build(name) {
    const reg0 = name.length;
    const reg1 = name.lastIndexOf(".js");
    if (reg1 === -1) {
        // console.log(`跳过${name}因为它不是.js文件`);
        return false;
    }
    if (reg1 + 3 !== reg0) {
        // console.log(`跳过${name}因为它不是.js文件`);
        return false;
    }
    const reg2 = name.lastIndexOf(".min.js");
    if (reg2 !== -1) {
        // console.log(`跳过${name}因为它己经是min.js文件`);
        return false;
    }
    const s0 = name.substr(0, reg1);
    const cmd = `uglifyjs bin\\js\\${s0}.js -m -o bin\\js\\${s0}.min.js`;
    console.log(cmd);
    exec(cmd);
    return true;
}

function readNotes(lines) {
    let a = false;
    let b = false;

    const notes = [];

    while (lines.length > 0) {
        const line = lines.shift();

        let str = trim(line);
        if (str === "") {
            continue;
        }

        if (str.indexOf("/*") === 0) {
            a = true;
            continue;
        }
        if (str.indexOf("*/") === 0) {
            b = true;
            break;
        }

        if (str.indexOf("*") === 0) {
            str = trim(str.substr(1));
        }
        else if (str.indexOf(" *") === 0) {
            str = trim(str.substr(2));
        }
        else if (str.indexOf("//") === 0) {
            str = trim(str.substr(2));
        }
        else if (a === true) {
            str = trim(str);
        }
        else {
            lines.unshift(line);
            break;
        }
        notes.push(str);
    }

    if (a !== b) {
        throw Error("读取注释有误");
    }

    if (notes.length === 0) {
        return notes;
    }

    return notes.concat(readNotes(lines));
}

function trim(str) {
    const array = str.split("");
    const letters = ["", " ", "\t", "\r", "\n"];

    while (true) {
        if (letters.indexOf(array[0]) > -1) {
            array.shift();
        }
        else if (letters.indexOf(array[array.length - 1]) > -1) {
            array.pop();
        }
        else {
            break;
        }
    }

    return array.join("");
}