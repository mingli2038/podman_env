// 引入 Express
const express = require('express');
const fs = require('fs');
const psList = require("ps-list");
const { exec } = require('child_process');
const path = require('path');
const app = express();

const PORT = 4567;

//输出日志到文件
console.log = (message) => {
    try {
        const logEntry = `[${new Date().toISOString()}] ${message}\n`;
        fs.appendFileSync('/tmp/run.log', logEntry);
    } catch (err) {
        console.error(`日志写入失败: ${err.message}`);
    }
};

// 处理根路径请求
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get("/tmp", function(req, res) {
    const tmpDir = "/tmp"; // 指定 `/tmp` 目录
    const files = fs.readdirSync(tmpDir); // 读取 `/tmp` 目录下的文件列表
    res.send({
        currentDirectory: tmpDir,
        files: files
    });
});
app.get("/home", function(req, res) {
    const currentDir = process.cwd(); // 获取当前工作目录
    const files = fs.readdirSync(currentDir); // 读取文件列表

    res.send({
        currentDirectory: currentDir,
        files: files
    });
});
app.get("/process", async (req, res) => {
    try {
        const processes = await psList();
        res.json({
            message: "当前运行的进程",
            processes: processes
        });
    } catch (error) {
        res.status(500).json({ error: "无法获取进程信息", details: error.message });
    }
});

function runCommand(command) {
    try {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`执行命令出错: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`命令错误输出: ${stderr}`);
                return;
            }
            console.log(`命令标准输出: ${stdout}`);
        });

        console.log('命令执行中...');
    } catch (err) {
        console.error(`运行出错: ${err}`);
    }
}
const sshxOutputFilePath = "/tmp/sshx_output.log"
const logFilePath"/tmp/run.log"
app.get('/sshx', (req, res) => {
    const command = `curl -sSf https://sshx.io/get | sh -s run >${sshxOutputFilePath} 2>&1`;
    fs.appendFileSync(logFilePath, `Executing command: ${command}\n`);
    
    console.log(`Executing command: ${command}`);
    res.send(`Executing command: ${command}. Output will be in ${sshxOutputFilePath}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            fs.appendFileSync(logFilePath, `Command execution error: ${error.message}\n`);
            console.error(`Command execution error: ${error.message}`);
            return;
        }
        // stdout and stderr are redirected to /tmp/sshx_output.log, so they might be empty here
        fs.appendFileSync(logFilePath, `Command finished. Output redirected to ${sshxOutputFilePath}\n`);
        console.log(`Command finished. Output redirected to ${sshxOutputFilePath}`);
    });

});

app.get('/getssh', (req, res) => {
    fs.readFile(sshxOutputFilePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.status(404).send(`Output file not found: ${sshxOutputFilePath}. Run /sshx first.`);
            } else {
                res.status(500).send(`Error reading output file: ${err.message}`);
            }
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.send(data);
        }
    });
});
// const command = "cat part_* > /tmp/lg.tar.gz";

// runCommand(command);

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器已启动，在 http://localhost:${PORT}`);
});
