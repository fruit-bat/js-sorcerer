"use strict";
function Z80(coreParameter) {
    let core = coreParameter;
    if (!core || (typeof core.mem_read !== "function") || (typeof core.mem_write !== "function") ||
        (typeof core.io_read !== "function") || (typeof core.io_write !== "function"))
        throw ("Z80: Core object is missing required functions.");
    if (this === window)
        throw ("Z80: This function is a constructor; call it using operator new.");
    let a = 0x00;
    let b = 0x00;
    let c = 0x00;
    let d = 0x00;
    let e = 0x00;
    let h = 0x00;
    let l = 0x00;
    let a_prime = 0x00;
    let b_prime = 0x00;
    let c_prime = 0x00;
    let d_prime = 0x00;
    let e_prime = 0x00;
    let h_prime = 0x00;
    let l_prime = 0x00;
    let ix = 0x0000;
    let iy = 0x0000;
    let i = 0x00;
    let r = 0x00;
    let sp = 0xdff0;
    let pc = 0x0000;
    let flags = { S: 0, Z: 0, Y: 0, H: 0, X: 0, P: 0, N: 0, C: 0 };
    let flags_prime = { S: 0, Z: 0, Y: 0, H: 0, X: 0, P: 0, N: 0, C: 0 };
    let imode = 0;
    let iff1 = 0;
    let iff2 = 0;
    let halted = false;
    let do_delayed_di = false;
    let do_delayed_ei = false;
    let cycle_counter = 0;
    function getState() {
        return {
            b: b,
            a: a,
            c: c,
            d: d,
            e: e,
            h: h,
            l: l,
            a_prime: a_prime,
            b_prime: b_prime,
            c_prime: c_prime,
            d_prime: d_prime,
            e_prime: e_prime,
            h_prime: h_prime,
            l_prime: l_prime,
            ix: ix,
            iy: iy,
            i: i,
            r: r,
            sp: sp,
            pc: pc,
            flags: {
                S: flags.S,
                Z: flags.Z,
                Y: flags.Y,
                H: flags.H,
                X: flags.X,
                P: flags.P,
                N: flags.N,
                C: flags.C
            },
            flags_prime: {
                S: flags_prime.S,
                Z: flags_prime.Z,
                Y: flags_prime.Y,
                H: flags_prime.H,
                X: flags_prime.X,
                P: flags_prime.P,
                N: flags_prime.N,
                C: flags_prime.C
            },
            imode: imode,
            iff1: iff1,
            iff2: iff2,
            halted: halted,
            do_delayed_di: do_delayed_di,
            do_delayed_ei: do_delayed_ei,
            cycle_counter: cycle_counter
        };
    }
    function setState(state) {
        b = state.b;
        a = state.a;
        c = state.c;
        d = state.d;
        e = state.e;
        h = state.h;
        l = state.l;
        a_prime = state.a_prime;
        b_prime = state.b_prime;
        c_prime = state.c_prime;
        d_prime = state.d_prime;
        e_prime = state.e_prime;
        h_prime = state.h_prime;
        l_prime = state.l_prime;
        ix = state.ix;
        iy = state.iy;
        i = state.i;
        r = state.r;
        sp = state.sp;
        pc = state.pc;
        flags.S = state.flags.S;
        flags.Z = state.flags.Z;
        flags.Y = state.flags.Y;
        flags.H = state.flags.H;
        flags.X = state.flags.X;
        flags.P = state.flags.P;
        flags.N = state.flags.N;
        flags.C = state.flags.C;
        flags_prime.S = state.flags_prime.S;
        flags_prime.Z = state.flags_prime.Z;
        flags_prime.Y = state.flags_prime.Y;
        flags_prime.H = state.flags_prime.H;
        flags_prime.X = state.flags_prime.X;
        flags_prime.P = state.flags_prime.P;
        flags_prime.N = state.flags_prime.N;
        flags_prime.C = state.flags_prime.C;
        imode = state.imode;
        iff1 = state.iff1;
        iff2 = state.iff2;
        halted = state.halted;
        do_delayed_di = state.do_delayed_di;
        do_delayed_ei = state.do_delayed_ei;
        cycle_counter = state.cycle_counter;
    }
    let reset = function () {
        sp = 0xdff0;
        pc = 0x0000;
        a = 0x00;
        r = 0x00;
        set_flags_register(0);
        imode = 0;
        iff1 = 0;
        iff2 = 0;
        halted = false;
        do_delayed_di = false;
        do_delayed_ei = false;
        cycle_counter = 0;
    };
    let run_instruction = function () {
        if (!halted) {
            var doing_delayed_di = false, doing_delayed_ei = false;
            if (do_delayed_di) {
                do_delayed_di = false;
                doing_delayed_di = true;
            }
            else if (do_delayed_ei) {
                do_delayed_ei = false;
                doing_delayed_ei = true;
            }
            r = (r & 0x80) | (((r & 0x7f) + 1) & 0x7f);
            var opcode = core.mem_read(pc);
            decode_instruction(opcode);
            pc = (pc + 1) & 0xffff;
            if (doing_delayed_di) {
                iff1 = 0;
                iff2 = 0;
            }
            else if (doing_delayed_ei) {
                iff1 = 1;
                iff2 = 1;
            }
            var retval = cycle_counter;
            cycle_counter = 0;
            return retval;
        }
        else {
            return 1;
        }
    };
    let interrupt = function (non_maskable, data) {
        if (non_maskable) {
            r = (r & 0x80) | (((r & 0x7f) + 1) & 0x7f);
            halted = false;
            iff2 = iff1;
            iff1 = 0;
            push_word(pc);
            pc = 0x66;
            cycle_counter += 11;
        }
        else if (iff1) {
            r = (r & 0x80) | (((r & 0x7f) + 1) & 0x7f);
            halted = false;
            iff1 = 0;
            iff2 = 0;
            if (imode === 0) {
                decode_instruction(data);
                cycle_counter += 2;
            }
            else if (imode === 1) {
                push_word(pc);
                pc = 0x38;
                cycle_counter += 13;
            }
            else if (imode === 2) {
                push_word(pc);
                var vector_address = ((i << 8) | data);
                pc = core.mem_read(vector_address) |
                    (core.mem_read((vector_address + 1) & 0xffff) << 8);
                cycle_counter += 19;
            }
        }
    };
    let decode_instruction = function (opcode) {
        var get_operand = function (opcode) {
            return ((opcode & 0x07) === 0) ? b :
                ((opcode & 0x07) === 1) ? c :
                    ((opcode & 0x07) === 2) ? d :
                        ((opcode & 0x07) === 3) ? e :
                            ((opcode & 0x07) === 4) ? h :
                                ((opcode & 0x07) === 5) ? l :
                                    ((opcode & 0x07) === 6) ? core.mem_read(l | (h << 8)) : a;
        };
        if (opcode === 0x76) {
            halted = true;
        }
        else if ((opcode >= 0x40) && (opcode < 0x80)) {
            var operand = get_operand(opcode);
            if (((opcode & 0x38) >>> 3) === 0)
                b = operand;
            else if (((opcode & 0x38) >>> 3) === 1)
                c = operand;
            else if (((opcode & 0x38) >>> 3) === 2)
                d = operand;
            else if (((opcode & 0x38) >>> 3) === 3)
                e = operand;
            else if (((opcode & 0x38) >>> 3) === 4)
                h = operand;
            else if (((opcode & 0x38) >>> 3) === 5)
                l = operand;
            else if (((opcode & 0x38) >>> 3) === 6)
                core.mem_write(l | (h << 8), operand);
            else if (((opcode & 0x38) >>> 3) === 7)
                a = operand;
        }
        else if ((opcode >= 0x80) && (opcode < 0xc0)) {
            var operand = get_operand(opcode), op_array = [do_add, do_adc, do_sub, do_sbc,
                do_and, do_xor, do_or, do_cp];
            op_array[(opcode & 0x38) >>> 3](operand);
        }
        else {
            var func = instructions[opcode];
            func();
        }
        cycle_counter += cycle_counts[opcode];
    };
    let get_signed_offset_byte = function (value) {
        value &= 0xff;
        if (value & 0x80) {
            value = -((0xff & ~value) + 1);
        }
        return value;
    };
    let get_flags_register = function () {
        return (flags.S << 7) |
            (flags.Z << 6) |
            (flags.Y << 5) |
            (flags.H << 4) |
            (flags.X << 3) |
            (flags.P << 2) |
            (flags.N << 1) |
            (flags.C);
    };
    let get_flags_prime = function () {
        return (flags_prime.S << 7) |
            (flags_prime.Z << 6) |
            (flags_prime.Y << 5) |
            (flags_prime.H << 4) |
            (flags_prime.X << 3) |
            (flags_prime.P << 2) |
            (flags_prime.N << 1) |
            (flags_prime.C);
    };
    let set_flags_register = function (operand) {
        flags.S = (operand & 0x80) >>> 7;
        flags.Z = (operand & 0x40) >>> 6;
        flags.Y = (operand & 0x20) >>> 5;
        flags.H = (operand & 0x10) >>> 4;
        flags.X = (operand & 0x08) >>> 3;
        flags.P = (operand & 0x04) >>> 2;
        flags.N = (operand & 0x02) >>> 1;
        flags.C = (operand & 0x01);
    };
    let set_flags_prime = function (operand) {
        flags_prime.S = (operand & 0x80) >>> 7;
        flags_prime.Z = (operand & 0x40) >>> 6;
        flags_prime.Y = (operand & 0x20) >>> 5;
        flags_prime.H = (operand & 0x10) >>> 4;
        flags_prime.X = (operand & 0x08) >>> 3;
        flags_prime.P = (operand & 0x04) >>> 2;
        flags_prime.N = (operand & 0x02) >>> 1;
        flags_prime.C = (operand & 0x01);
    };
    let update_xy_flags = function (result) {
        flags.Y = (result & 0x20) >>> 5;
        flags.X = (result & 0x08) >>> 3;
    };
    let get_parity = function (value) {
        var parity_bits = [
            1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
            0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
            0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
            1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
            0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
            1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
            1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
            0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
            0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
            1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
            1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
            0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
            1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
            0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
            0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
            1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1
        ];
        return parity_bits[value];
    };
    let push_word = function (operand) {
        sp = (sp - 1) & 0xffff;
        core.mem_write(sp, (operand & 0xff00) >>> 8);
        sp = (sp - 1) & 0xffff;
        core.mem_write(sp, operand & 0x00ff);
    };
    let pop_word = function () {
        var retval = core.mem_read(sp) & 0xff;
        sp = (sp + 1) & 0xffff;
        retval |= core.mem_read(sp) << 8;
        sp = (sp + 1) & 0xffff;
        return retval;
    };
    let do_conditional_absolute_jump = function (condition) {
        if (condition) {
            pc = core.mem_read((pc + 1) & 0xffff) |
                (core.mem_read((pc + 2) & 0xffff) << 8);
            pc = (pc - 1) & 0xffff;
        }
        else {
            pc = (pc + 2) & 0xffff;
        }
    };
    let do_conditional_relative_jump = function (condition) {
        if (condition) {
            cycle_counter += 5;
            var offset = get_signed_offset_byte(core.mem_read((pc + 1) & 0xffff));
            pc = (pc + offset + 1) & 0xffff;
        }
        else {
            pc = (pc + 1) & 0xffff;
        }
    };
    let do_conditional_call = function (condition) {
        if (condition) {
            cycle_counter += 7;
            push_word((pc + 3) & 0xffff);
            pc = core.mem_read((pc + 1) & 0xffff) |
                (core.mem_read((pc + 2) & 0xffff) << 8);
            pc = (pc - 1) & 0xffff;
        }
        else {
            pc = (pc + 2) & 0xffff;
        }
    };
    let do_conditional_return = function (condition) {
        if (condition) {
            cycle_counter += 6;
            pc = (pop_word() - 1) & 0xffff;
        }
    };
    let do_reset = function (address) {
        push_word((pc + 1) & 0xffff);
        pc = (address - 1) & 0xffff;
    };
    let do_add = function (operand) {
        var result = a + operand;
        flags.S = (result & 0x80) ? 1 : 0;
        flags.Z = !(result & 0xff) ? 1 : 0;
        flags.H = (((operand & 0x0f) + (a & 0x0f)) & 0x10) ? 1 : 0;
        flags.P = ((a & 0x80) === (operand & 0x80)) && ((a & 0x80) !== (result & 0x80)) ? 1 : 0;
        flags.N = 0;
        flags.C = (result & 0x100) ? 1 : 0;
        a = result & 0xff;
        update_xy_flags(a);
    };
    let do_adc = function (operand) {
        var result = a + operand + flags.C;
        flags.S = (result & 0x80) ? 1 : 0;
        flags.Z = !(result & 0xff) ? 1 : 0;
        flags.H = (((operand & 0x0f) + (a & 0x0f) + flags.C) & 0x10) ? 1 : 0;
        flags.P = ((a & 0x80) === (operand & 0x80)) && ((a & 0x80) !== (result & 0x80)) ? 1 : 0;
        flags.N = 0;
        flags.C = (result & 0x100) ? 1 : 0;
        a = result & 0xff;
        update_xy_flags(a);
    };
    let do_sub = function (operand) {
        var result = a - operand;
        flags.S = (result & 0x80) ? 1 : 0;
        flags.Z = !(result & 0xff) ? 1 : 0;
        flags.H = (((a & 0x0f) - (operand & 0x0f)) & 0x10) ? 1 : 0;
        flags.P = ((a & 0x80) !== (operand & 0x80)) && ((a & 0x80) !== (result & 0x80)) ? 1 : 0;
        flags.N = 1;
        flags.C = (result & 0x100) ? 1 : 0;
        a = result & 0xff;
        update_xy_flags(a);
    };
    let do_sbc = function (operand) {
        var result = a - operand - flags.C;
        flags.S = (result & 0x80) ? 1 : 0;
        flags.Z = !(result & 0xff) ? 1 : 0;
        flags.H = (((a & 0x0f) - (operand & 0x0f) - flags.C) & 0x10) ? 1 : 0;
        flags.P = ((a & 0x80) !== (operand & 0x80)) && ((a & 0x80) !== (result & 0x80)) ? 1 : 0;
        flags.N = 1;
        flags.C = (result & 0x100) ? 1 : 0;
        a = result & 0xff;
        update_xy_flags(a);
    };
    let do_cp = function (operand) {
        var temp = a;
        do_sub(operand);
        a = temp;
        update_xy_flags(operand);
    };
    let do_and = function (operand) {
        a &= operand & 0xff;
        flags.S = (a & 0x80) ? 1 : 0;
        flags.Z = !a ? 1 : 0;
        flags.H = 1;
        flags.P = get_parity(a);
        flags.N = 0;
        flags.C = 0;
        update_xy_flags(a);
    };
    let do_or = function (operand) {
        a = (operand | a) & 0xff;
        flags.S = (a & 0x80) ? 1 : 0;
        flags.Z = !a ? 1 : 0;
        flags.H = 0;
        flags.P = get_parity(a);
        flags.N = 0;
        flags.C = 0;
        update_xy_flags(a);
    };
    let do_xor = function (operand) {
        a = (operand ^ a) & 0xff;
        flags.S = (a & 0x80) ? 1 : 0;
        flags.Z = !a ? 1 : 0;
        flags.H = 0;
        flags.P = get_parity(a);
        flags.N = 0;
        flags.C = 0;
        update_xy_flags(a);
    };
    let do_inc = function (operand) {
        var result = operand + 1;
        flags.S = (result & 0x80) ? 1 : 0;
        flags.Z = !(result & 0xff) ? 1 : 0;
        flags.H = ((operand & 0x0f) === 0x0f) ? 1 : 0;
        flags.P = (operand === 0x7f) ? 1 : 0;
        flags.N = 0;
        result &= 0xff;
        update_xy_flags(result);
        return result;
    };
    let do_dec = function (operand) {
        var result = operand - 1;
        flags.S = (result & 0x80) ? 1 : 0;
        flags.Z = !(result & 0xff) ? 1 : 0;
        flags.H = ((operand & 0x0f) === 0x00) ? 1 : 0;
        flags.P = (operand === 0x80) ? 1 : 0;
        flags.N = 1;
        result &= 0xff;
        update_xy_flags(result);
        return result;
    };
    let do_hl_add = function (operand) {
        var hl = l | (h << 8), result = hl + operand;
        flags.N = 0;
        flags.C = (result & 0x10000) ? 1 : 0;
        flags.H = (((hl & 0x0fff) + (operand & 0x0fff)) & 0x1000) ? 1 : 0;
        l = result & 0xff;
        h = (result & 0xff00) >>> 8;
        update_xy_flags(h);
    };
    let do_hl_adc = function (operand) {
        operand += flags.C;
        var hl = l | (h << 8), result = hl + operand;
        flags.S = (result & 0x8000) ? 1 : 0;
        flags.Z = !(result & 0xffff) ? 1 : 0;
        flags.H = (((hl & 0x0fff) + (operand & 0x0fff)) & 0x1000) ? 1 : 0;
        flags.P = ((hl & 0x8000) === (operand & 0x8000)) && ((result & 0x8000) !== (hl & 0x8000)) ? 1 : 0;
        flags.N = 0;
        flags.C = (result & 0x10000) ? 1 : 0;
        l = result & 0xff;
        h = (result >>> 8) & 0xff;
        update_xy_flags(h);
    };
    let do_hl_sbc = function (operand) {
        operand += flags.C;
        var hl = l | (h << 8), result = hl - operand;
        flags.S = (result & 0x8000) ? 1 : 0;
        flags.Z = !(result & 0xffff) ? 1 : 0;
        flags.H = (((hl & 0x0fff) - (operand & 0x0fff)) & 0x1000) ? 1 : 0;
        flags.P = ((hl & 0x8000) !== (operand & 0x8000)) && ((result & 0x8000) !== (hl & 0x8000)) ? 1 : 0;
        flags.N = 1;
        flags.C = (result & 0x10000) ? 1 : 0;
        l = result & 0xff;
        h = (result >>> 8) & 0xff;
        update_xy_flags(h);
    };
    let do_in = function (port) {
        var result = core.io_read(port);
        flags.S = (result & 0x80) ? 1 : 0;
        flags.Z = result ? 0 : 1;
        flags.H = 0;
        flags.P = get_parity(result) ? 1 : 0;
        flags.N = 0;
        update_xy_flags(result);
        return result;
    };
    let do_neg = function () {
        if (a !== 0x80) {
            a = get_signed_offset_byte(a);
            a = (-a) & 0xff;
        }
        flags.S = (a & 0x80) ? 1 : 0;
        flags.Z = !a ? 1 : 0;
        flags.H = (((-a) & 0x0f) > 0) ? 1 : 0;
        flags.P = (a === 0x80) ? 1 : 0;
        flags.N = 1;
        flags.C = a ? 1 : 0;
        update_xy_flags(a);
    };
    let do_ldi = function () {
        var read_value = core.mem_read(l | (h << 8));
        core.mem_write(e | (d << 8), read_value);
        var result = (e | (d << 8)) + 1;
        e = result & 0xff;
        d = (result & 0xff00) >>> 8;
        result = (l | (h << 8)) + 1;
        l = result & 0xff;
        h = (result & 0xff00) >>> 8;
        result = (c | (b << 8)) - 1;
        c = result & 0xff;
        b = (result & 0xff00) >>> 8;
        flags.H = 0;
        flags.P = (c || b) ? 1 : 0;
        flags.N = 0;
        flags.Y = ((a + read_value) & 0x02) >>> 1;
        flags.X = ((a + read_value) & 0x08) >>> 3;
    };
    let do_cpi = function () {
        var temp_carry = flags.C;
        var read_value = core.mem_read(l | (h << 8));
        do_cp(read_value);
        flags.C = temp_carry;
        flags.Y = ((a - read_value - flags.H) & 0x02) >>> 1;
        flags.X = ((a - read_value - flags.H) & 0x08) >>> 3;
        var result = (l | (h << 8)) + 1;
        l = result & 0xff;
        h = (result & 0xff00) >>> 8;
        result = (c | (b << 8)) - 1;
        c = result & 0xff;
        b = (result & 0xff00) >>> 8;
        flags.P = result ? 1 : 0;
    };
    let do_ini = function () {
        b = do_dec(b);
        core.mem_write(l | (h << 8), core.io_read((b << 8) | c));
        var result = (l | (h << 8)) + 1;
        l = result & 0xff;
        h = (result & 0xff00) >>> 8;
        flags.N = 1;
    };
    let do_outi = function () {
        core.io_write((b << 8) | c, core.mem_read(l | (h << 8)));
        var result = (l | (h << 8)) + 1;
        l = result & 0xff;
        h = (result & 0xff00) >>> 8;
        b = do_dec(b);
        flags.N = 1;
    };
    let do_ldd = function () {
        flags.N = 0;
        flags.H = 0;
        var read_value = core.mem_read(l | (h << 8));
        core.mem_write(e | (d << 8), read_value);
        var result = (e | (d << 8)) - 1;
        e = result & 0xff;
        d = (result & 0xff00) >>> 8;
        result = (l | (h << 8)) - 1;
        l = result & 0xff;
        h = (result & 0xff00) >>> 8;
        result = (c | (b << 8)) - 1;
        c = result & 0xff;
        b = (result & 0xff00) >>> 8;
        flags.P = (c || b) ? 1 : 0;
        flags.Y = ((a + read_value) & 0x02) >>> 1;
        flags.X = ((a + read_value) & 0x08) >>> 3;
    };
    let do_cpd = function () {
        var temp_carry = flags.C;
        var read_value = core.mem_read(l | (h << 8));
        do_cp(read_value);
        flags.C = temp_carry;
        flags.Y = ((a - read_value - flags.H) & 0x02) >>> 1;
        flags.X = ((a - read_value - flags.H) & 0x08) >>> 3;
        var result = (l | (h << 8)) - 1;
        l = result & 0xff;
        h = (result & 0xff00) >>> 8;
        result = (c | (b << 8)) - 1;
        c = result & 0xff;
        b = (result & 0xff00) >>> 8;
        flags.P = result ? 1 : 0;
    };
    let do_ind = function () {
        b = do_dec(b);
        core.mem_write(l | (h << 8), core.io_read((b << 8) | c));
        var result = (l | (h << 8)) - 1;
        l = result & 0xff;
        h = (result & 0xff00) >>> 8;
        flags.N = 1;
    };
    let do_outd = function () {
        core.io_write((b << 8) | c, core.mem_read(l | (h << 8)));
        var result = (l | (h << 8)) - 1;
        l = result & 0xff;
        h = (result & 0xff00) >>> 8;
        b = do_dec(b);
        flags.N = 1;
    };
    let do_rlc = function (operand) {
        flags.N = 0;
        flags.H = 0;
        flags.C = (operand & 0x80) >>> 7;
        operand = ((operand << 1) | flags.C) & 0xff;
        flags.Z = !operand ? 1 : 0;
        flags.P = get_parity(operand);
        flags.S = (operand & 0x80) ? 1 : 0;
        update_xy_flags(operand);
        return operand;
    };
    let do_rrc = function (operand) {
        flags.N = 0;
        flags.H = 0;
        flags.C = operand & 1;
        operand = ((operand >>> 1) & 0x7f) | (flags.C << 7);
        flags.Z = !(operand & 0xff) ? 1 : 0;
        flags.P = get_parity(operand);
        flags.S = (operand & 0x80) ? 1 : 0;
        update_xy_flags(operand);
        return operand & 0xff;
    };
    let do_rl = function (operand) {
        flags.N = 0;
        flags.H = 0;
        var temp = flags.C;
        flags.C = (operand & 0x80) >>> 7;
        operand = ((operand << 1) | temp) & 0xff;
        flags.Z = !operand ? 1 : 0;
        flags.P = get_parity(operand);
        flags.S = (operand & 0x80) ? 1 : 0;
        update_xy_flags(operand);
        return operand;
    };
    let do_rr = function (operand) {
        flags.N = 0;
        flags.H = 0;
        var temp = flags.C;
        flags.C = operand & 1;
        operand = ((operand >>> 1) & 0x7f) | (temp << 7);
        flags.Z = !operand ? 1 : 0;
        flags.P = get_parity(operand);
        flags.S = (operand & 0x80) ? 1 : 0;
        update_xy_flags(operand);
        return operand;
    };
    let do_sla = function (operand) {
        flags.N = 0;
        flags.H = 0;
        flags.C = (operand & 0x80) >>> 7;
        operand = (operand << 1) & 0xff;
        flags.Z = !operand ? 1 : 0;
        flags.P = get_parity(operand);
        flags.S = (operand & 0x80) ? 1 : 0;
        update_xy_flags(operand);
        return operand;
    };
    let do_sra = function (operand) {
        flags.N = 0;
        flags.H = 0;
        flags.C = operand & 1;
        operand = ((operand >>> 1) & 0x7f) | (operand & 0x80);
        flags.Z = !operand ? 1 : 0;
        flags.P = get_parity(operand);
        flags.S = (operand & 0x80) ? 1 : 0;
        update_xy_flags(operand);
        return operand;
    };
    let do_sll = function (operand) {
        flags.N = 0;
        flags.H = 0;
        flags.C = (operand & 0x80) >>> 7;
        operand = ((operand << 1) & 0xff) | 1;
        flags.Z = !operand ? 1 : 0;
        flags.P = get_parity(operand);
        flags.S = (operand & 0x80) ? 1 : 0;
        update_xy_flags(operand);
        return operand;
    };
    let do_srl = function (operand) {
        flags.N = 0;
        flags.H = 0;
        flags.C = operand & 1;
        operand = (operand >>> 1) & 0x7f;
        flags.Z = !operand ? 1 : 0;
        flags.P = get_parity(operand);
        flags.S = 0;
        update_xy_flags(operand);
        return operand;
    };
    let do_ix_add = function (operand) {
        flags.N = 0;
        var result = ix + operand;
        flags.C = (result & 0x10000) ? 1 : 0;
        flags.H = (((ix & 0xfff) + (operand & 0xfff)) & 0x1000) ? 1 : 0;
        update_xy_flags((result & 0xff00) >>> 8);
        ix = result;
    };
    let instructions = [];
    instructions[0x00] = function () { };
    instructions[0x01] = function () {
        pc = (pc + 1) & 0xffff;
        c = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        b = core.mem_read(pc);
    };
    instructions[0x02] = function () {
        core.mem_write(c | (b << 8), a);
    };
    instructions[0x03] = function () {
        var result = (c | (b << 8));
        result += 1;
        c = result & 0xff;
        b = (result & 0xff00) >>> 8;
    };
    instructions[0x04] = function () {
        b = do_inc(b);
    };
    instructions[0x05] = function () {
        b = do_dec(b);
    };
    instructions[0x06] = function () {
        pc = (pc + 1) & 0xffff;
        b = core.mem_read(pc);
    };
    instructions[0x07] = function () {
        var temp_s = flags.S, temp_z = flags.Z, temp_p = flags.P;
        a = do_rlc(a);
        flags.S = temp_s;
        flags.Z = temp_z;
        flags.P = temp_p;
    };
    instructions[0x08] = function () {
        var temp = a;
        a = a_prime;
        a_prime = temp;
        temp = get_flags_register();
        set_flags_register(get_flags_prime());
        set_flags_prime(temp);
    };
    instructions[0x09] = function () {
        do_hl_add(c | (b << 8));
    };
    instructions[0x0a] = function () {
        a = core.mem_read(c | (b << 8));
    };
    instructions[0x0b] = function () {
        var result = (c | (b << 8));
        result -= 1;
        c = result & 0xff;
        b = (result & 0xff00) >>> 8;
    };
    instructions[0x0c] = function () {
        c = do_inc(c);
    };
    instructions[0x0d] = function () {
        c = do_dec(c);
    };
    instructions[0x0e] = function () {
        pc = (pc + 1) & 0xffff;
        c = core.mem_read(pc);
    };
    instructions[0x0f] = function () {
        var temp_s = flags.S, temp_z = flags.Z, temp_p = flags.P;
        a = do_rrc(a);
        flags.S = temp_s;
        flags.Z = temp_z;
        flags.P = temp_p;
    };
    instructions[0x10] = function () {
        b = (b - 1) & 0xff;
        do_conditional_relative_jump(b !== 0);
    };
    instructions[0x11] = function () {
        pc = (pc + 1) & 0xffff;
        e = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        d = core.mem_read(pc);
    };
    instructions[0x12] = function () {
        core.mem_write(e | (d << 8), a);
    };
    instructions[0x13] = function () {
        var result = (e | (d << 8));
        result += 1;
        e = result & 0xff;
        d = (result & 0xff00) >>> 8;
    };
    instructions[0x14] = function () {
        d = do_inc(d);
    };
    instructions[0x15] = function () {
        d = do_dec(d);
    };
    instructions[0x16] = function () {
        pc = (pc + 1) & 0xffff;
        d = core.mem_read(pc);
    };
    instructions[0x17] = function () {
        var temp_s = flags.S, temp_z = flags.Z, temp_p = flags.P;
        a = do_rl(a);
        flags.S = temp_s;
        flags.Z = temp_z;
        flags.P = temp_p;
    };
    instructions[0x18] = function () {
        var offset = get_signed_offset_byte(core.mem_read((pc + 1) & 0xffff));
        pc = (pc + offset + 1) & 0xffff;
    };
    instructions[0x19] = function () {
        do_hl_add(e | (d << 8));
    };
    instructions[0x1a] = function () {
        a = core.mem_read(e | (d << 8));
    };
    instructions[0x1b] = function () {
        var result = (e | (d << 8));
        result -= 1;
        e = result & 0xff;
        d = (result & 0xff00) >>> 8;
    };
    instructions[0x1c] = function () {
        e = do_inc(e);
    };
    instructions[0x1d] = function () {
        e = do_dec(e);
    };
    instructions[0x1e] = function () {
        pc = (pc + 1) & 0xffff;
        e = core.mem_read(pc);
    };
    instructions[0x1f] = function () {
        var temp_s = flags.S, temp_z = flags.Z, temp_p = flags.P;
        a = do_rr(a);
        flags.S = temp_s;
        flags.Z = temp_z;
        flags.P = temp_p;
    };
    instructions[0x20] = function () {
        do_conditional_relative_jump(!flags.Z);
    };
    instructions[0x21] = function () {
        pc = (pc + 1) & 0xffff;
        l = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        h = core.mem_read(pc);
    };
    instructions[0x22] = function () {
        pc = (pc + 1) & 0xffff;
        var address = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        address |= core.mem_read(pc) << 8;
        core.mem_write(address, l);
        core.mem_write((address + 1) & 0xffff, h);
    };
    instructions[0x23] = function () {
        var result = (l | (h << 8));
        result += 1;
        l = result & 0xff;
        h = (result & 0xff00) >>> 8;
    };
    instructions[0x24] = function () {
        h = do_inc(h);
    };
    instructions[0x25] = function () {
        h = do_dec(h);
    };
    instructions[0x26] = function () {
        pc = (pc + 1) & 0xffff;
        h = core.mem_read(pc);
    };
    instructions[0x27] = function () {
        var temp = a;
        if (!flags.N) {
            if (flags.H || ((a & 0x0f) > 9))
                temp += 0x06;
            if (flags.C || (a > 0x99))
                temp += 0x60;
        }
        else {
            if (flags.H || ((a & 0x0f) > 9))
                temp -= 0x06;
            if (flags.C || (a > 0x99))
                temp -= 0x60;
        }
        flags.S = (temp & 0x80) ? 1 : 0;
        flags.Z = !(temp & 0xff) ? 1 : 0;
        flags.H = ((a & 0x10) ^ (temp & 0x10)) ? 1 : 0;
        flags.P = get_parity(temp & 0xff);
        flags.C = (flags.C || (a > 0x99)) ? 1 : 0;
        a = temp & 0xff;
        update_xy_flags(a);
    };
    instructions[0x28] = function () {
        do_conditional_relative_jump(!!flags.Z);
    };
    instructions[0x29] = function () {
        do_hl_add(l | (h << 8));
    };
    instructions[0x2a] = function () {
        pc = (pc + 1) & 0xffff;
        var address = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        address |= core.mem_read(pc) << 8;
        l = core.mem_read(address);
        h = core.mem_read((address + 1) & 0xffff);
    };
    instructions[0x2b] = function () {
        var result = (l | (h << 8));
        result -= 1;
        l = result & 0xff;
        h = (result & 0xff00) >>> 8;
    };
    instructions[0x2c] = function () {
        l = do_inc(l);
    };
    instructions[0x2d] = function () {
        l = do_dec(l);
    };
    instructions[0x2e] = function () {
        pc = (pc + 1) & 0xffff;
        l = core.mem_read(pc);
    };
    instructions[0x2f] = function () {
        a = (~a) & 0xff;
        flags.N = 1;
        flags.H = 1;
        update_xy_flags(a);
    };
    instructions[0x30] = function () {
        do_conditional_relative_jump(!flags.C);
    };
    instructions[0x31] = function () {
        sp = core.mem_read((pc + 1) & 0xffff) |
            (core.mem_read((pc + 2) & 0xffff) << 8);
        pc = (pc + 2) & 0xffff;
    };
    instructions[0x32] = function () {
        pc = (pc + 1) & 0xffff;
        var address = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        address |= core.mem_read(pc) << 8;
        core.mem_write(address, a);
    };
    instructions[0x33] = function () {
        sp = (sp + 1) & 0xffff;
    };
    instructions[0x34] = function () {
        var address = l | (h << 8);
        core.mem_write(address, do_inc(core.mem_read(address)));
    };
    instructions[0x35] = function () {
        var address = l | (h << 8);
        core.mem_write(address, do_dec(core.mem_read(address)));
    };
    instructions[0x36] = function () {
        pc = (pc + 1) & 0xffff;
        core.mem_write(l | (h << 8), core.mem_read(pc));
    };
    instructions[0x37] = function () {
        flags.N = 0;
        flags.H = 0;
        flags.C = 1;
        update_xy_flags(a);
    };
    instructions[0x38] = function () {
        do_conditional_relative_jump(!!flags.C);
    };
    instructions[0x39] = function () {
        do_hl_add(sp);
    };
    instructions[0x3a] = function () {
        pc = (pc + 1) & 0xffff;
        var address = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        address |= core.mem_read(pc) << 8;
        a = core.mem_read(address);
    };
    instructions[0x3b] = function () {
        sp = (sp - 1) & 0xffff;
    };
    instructions[0x3c] = function () {
        a = do_inc(a);
    };
    instructions[0x3d] = function () {
        a = do_dec(a);
    };
    instructions[0x3e] = function () {
        a = core.mem_read((pc + 1) & 0xffff);
        pc = (pc + 1) & 0xffff;
    };
    instructions[0x3f] = function () {
        flags.N = 0;
        flags.H = flags.C;
        flags.C = flags.C ? 0 : 1;
        update_xy_flags(a);
    };
    instructions[0xc0] = function () {
        do_conditional_return(!flags.Z);
    };
    instructions[0xc1] = function () {
        var result = pop_word();
        c = result & 0xff;
        b = (result & 0xff00) >>> 8;
    };
    instructions[0xc2] = function () {
        do_conditional_absolute_jump(!flags.Z);
    };
    instructions[0xc3] = function () {
        pc = core.mem_read((pc + 1) & 0xffff) |
            (core.mem_read((pc + 2) & 0xffff) << 8);
        pc = (pc - 1) & 0xffff;
    };
    instructions[0xc4] = function () {
        do_conditional_call(!flags.Z);
    };
    instructions[0xc5] = function () {
        push_word(c | (b << 8));
    };
    instructions[0xc6] = function () {
        pc = (pc + 1) & 0xffff;
        do_add(core.mem_read(pc));
    };
    instructions[0xc7] = function () {
        do_reset(0x00);
    };
    instructions[0xc8] = function () {
        do_conditional_return(!!flags.Z);
    };
    instructions[0xc9] = function () {
        pc = (pop_word() - 1) & 0xffff;
    };
    instructions[0xca] = function () {
        do_conditional_absolute_jump(!!flags.Z);
    };
    instructions[0xcb] = function () {
        r = (r & 0x80) | (((r & 0x7f) + 1) & 0x7f);
        pc = (pc + 1) & 0xffff;
        var opcode = core.mem_read(pc), bit_number = (opcode & 0x38) >>> 3, reg_code = opcode & 0x07;
        if (opcode < 0x40) {
            var op_array = [do_rlc, do_rrc, do_rl, do_rr,
                do_sla, do_sra, do_sll, do_srl];
            if (reg_code === 0)
                b = op_array[bit_number](b);
            else if (reg_code === 1)
                c = op_array[bit_number](c);
            else if (reg_code === 2)
                d = op_array[bit_number](d);
            else if (reg_code === 3)
                e = op_array[bit_number](e);
            else if (reg_code === 4)
                h = op_array[bit_number](h);
            else if (reg_code === 5)
                l = op_array[bit_number](l);
            else if (reg_code === 6)
                core.mem_write(l | (h << 8), op_array[bit_number](core.mem_read(l | (h << 8))));
            else if (reg_code === 7)
                a = op_array[bit_number](a);
        }
        else if (opcode < 0x80) {
            if (reg_code === 0)
                flags.Z = !(b & (1 << bit_number)) ? 1 : 0;
            else if (reg_code === 1)
                flags.Z = !(c & (1 << bit_number)) ? 1 : 0;
            else if (reg_code === 2)
                flags.Z = !(d & (1 << bit_number)) ? 1 : 0;
            else if (reg_code === 3)
                flags.Z = !(e & (1 << bit_number)) ? 1 : 0;
            else if (reg_code === 4)
                flags.Z = !(h & (1 << bit_number)) ? 1 : 0;
            else if (reg_code === 5)
                flags.Z = !(l & (1 << bit_number)) ? 1 : 0;
            else if (reg_code === 6)
                flags.Z = !((core.mem_read(l | (h << 8))) & (1 << bit_number)) ? 1 : 0;
            else if (reg_code === 7)
                flags.Z = !(a & (1 << bit_number)) ? 1 : 0;
            flags.N = 0;
            flags.H = 1;
            flags.P = flags.Z;
            flags.S = ((bit_number === 7) && !flags.Z) ? 1 : 0;
            flags.Y = ((bit_number === 5) && !flags.Z) ? 1 : 0;
            flags.X = ((bit_number === 3) && !flags.Z) ? 1 : 0;
        }
        else if (opcode < 0xc0) {
            if (reg_code === 0)
                b &= (0xff & ~(1 << bit_number));
            else if (reg_code === 1)
                c &= (0xff & ~(1 << bit_number));
            else if (reg_code === 2)
                d &= (0xff & ~(1 << bit_number));
            else if (reg_code === 3)
                e &= (0xff & ~(1 << bit_number));
            else if (reg_code === 4)
                h &= (0xff & ~(1 << bit_number));
            else if (reg_code === 5)
                l &= (0xff & ~(1 << bit_number));
            else if (reg_code === 6)
                core.mem_write(l | (h << 8), core.mem_read(l | (h << 8)) & ~(1 << bit_number));
            else if (reg_code === 7)
                a &= (0xff & ~(1 << bit_number));
        }
        else {
            if (reg_code === 0)
                b |= (1 << bit_number);
            else if (reg_code === 1)
                c |= (1 << bit_number);
            else if (reg_code === 2)
                d |= (1 << bit_number);
            else if (reg_code === 3)
                e |= (1 << bit_number);
            else if (reg_code === 4)
                h |= (1 << bit_number);
            else if (reg_code === 5)
                l |= (1 << bit_number);
            else if (reg_code === 6)
                core.mem_write(l | (h << 8), core.mem_read(l | (h << 8)) | (1 << bit_number));
            else if (reg_code === 7)
                a |= (1 << bit_number);
        }
        cycle_counter += cycle_counts_cb[opcode];
    };
    instructions[0xcc] = function () {
        do_conditional_call(!!flags.Z);
    };
    instructions[0xcd] = function () {
        push_word((pc + 3) & 0xffff);
        pc = core.mem_read((pc + 1) & 0xffff) |
            (core.mem_read((pc + 2) & 0xffff) << 8);
        pc = (pc - 1) & 0xffff;
    };
    instructions[0xce] = function () {
        pc = (pc + 1) & 0xffff;
        do_adc(core.mem_read(pc));
    };
    instructions[0xcf] = function () {
        do_reset(0x08);
    };
    instructions[0xd0] = function () {
        do_conditional_return(!flags.C);
    };
    instructions[0xd1] = function () {
        var result = pop_word();
        e = result & 0xff;
        d = (result & 0xff00) >>> 8;
    };
    instructions[0xd2] = function () {
        do_conditional_absolute_jump(!flags.C);
    };
    instructions[0xd3] = function () {
        pc = (pc + 1) & 0xffff;
        core.io_write((a << 8) | core.mem_read(pc), a);
    };
    instructions[0xd4] = function () {
        do_conditional_call(!flags.C);
    };
    instructions[0xd5] = function () {
        push_word(e | (d << 8));
    };
    instructions[0xd6] = function () {
        pc = (pc + 1) & 0xffff;
        do_sub(core.mem_read(pc));
    };
    instructions[0xd7] = function () {
        do_reset(0x10);
    };
    instructions[0xd8] = function () {
        do_conditional_return(!!flags.C);
    };
    instructions[0xd9] = function () {
        var temp = b;
        b = b_prime;
        b_prime = temp;
        temp = c;
        c = c_prime;
        c_prime = temp;
        temp = d;
        d = d_prime;
        d_prime = temp;
        temp = e;
        e = e_prime;
        e_prime = temp;
        temp = h;
        h = h_prime;
        h_prime = temp;
        temp = l;
        l = l_prime;
        l_prime = temp;
    };
    instructions[0xda] = function () {
        do_conditional_absolute_jump(!!flags.C);
    };
    instructions[0xdb] = function () {
        pc = (pc + 1) & 0xffff;
        a = core.io_read((a << 8) | core.mem_read(pc));
    };
    instructions[0xdc] = function () {
        do_conditional_call(!!flags.C);
    };
    instructions[0xdd] = function () {
        r = (r & 0x80) | (((r & 0x7f) + 1) & 0x7f);
        pc = (pc + 1) & 0xffff;
        var opcode = core.mem_read(pc), func = dd_instructions[opcode];
        if (func) {
            func();
            cycle_counter += cycle_counts_dd[opcode];
        }
        else {
            pc = (pc - 1) & 0xffff;
            cycle_counter += cycle_counts[0];
        }
    };
    instructions[0xde] = function () {
        pc = (pc + 1) & 0xffff;
        do_sbc(core.mem_read(pc));
    };
    instructions[0xdf] = function () {
        do_reset(0x18);
    };
    instructions[0xe0] = function () {
        do_conditional_return(!flags.P);
    };
    instructions[0xe1] = function () {
        var result = pop_word();
        l = result & 0xff;
        h = (result & 0xff00) >>> 8;
    };
    instructions[0xe2] = function () {
        do_conditional_absolute_jump(!flags.P);
    };
    instructions[0xe3] = function () {
        var temp = core.mem_read(sp);
        core.mem_write(sp, l);
        l = temp;
        temp = core.mem_read((sp + 1) & 0xffff);
        core.mem_write((sp + 1) & 0xffff, h);
        h = temp;
    };
    instructions[0xe4] = function () {
        do_conditional_call(!flags.P);
    };
    instructions[0xe5] = function () {
        push_word(l | (h << 8));
    };
    instructions[0xe6] = function () {
        pc = (pc + 1) & 0xffff;
        do_and(core.mem_read(pc));
    };
    instructions[0xe7] = function () {
        do_reset(0x20);
    };
    instructions[0xe8] = function () {
        do_conditional_return(!!flags.P);
    };
    instructions[0xe9] = function () {
        pc = l | (h << 8);
        pc = (pc - 1) & 0xffff;
    };
    instructions[0xea] = function () {
        do_conditional_absolute_jump(!!flags.P);
    };
    instructions[0xeb] = function () {
        var temp = d;
        d = h;
        h = temp;
        temp = e;
        e = l;
        l = temp;
    };
    instructions[0xec] = function () {
        do_conditional_call(!!flags.P);
    };
    instructions[0xed] = function () {
        r = (r & 0x80) | (((r & 0x7f) + 1) & 0x7f);
        pc = (pc + 1) & 0xffff;
        var opcode = core.mem_read(pc), func = ed_instructions[opcode];
        if (func) {
            func();
            cycle_counter += cycle_counts_ed[opcode];
        }
        else {
            cycle_counter += cycle_counts[0];
        }
    };
    instructions[0xee] = function () {
        pc = (pc + 1) & 0xffff;
        do_xor(core.mem_read(pc));
    };
    instructions[0xef] = function () {
        do_reset(0x28);
    };
    instructions[0xf0] = function () {
        do_conditional_return(!flags.S);
    };
    instructions[0xf1] = function () {
        var result = pop_word();
        set_flags_register(result & 0xff);
        a = (result & 0xff00) >>> 8;
    };
    instructions[0xf2] = function () {
        do_conditional_absolute_jump(!flags.S);
    };
    instructions[0xf3] = function () {
        do_delayed_di = true;
    };
    instructions[0xf4] = function () {
        do_conditional_call(!flags.S);
    };
    instructions[0xf5] = function () {
        push_word(get_flags_register() | (a << 8));
    };
    instructions[0xf6] = function () {
        pc = (pc + 1) & 0xffff;
        do_or(core.mem_read(pc));
    };
    instructions[0xf7] = function () {
        do_reset(0x30);
    };
    instructions[0xf8] = function () {
        do_conditional_return(!!flags.S);
    };
    instructions[0xf9] = function () {
        sp = l | (h << 8);
    };
    instructions[0xfa] = function () {
        do_conditional_absolute_jump(!!flags.S);
    };
    instructions[0xfb] = function () {
        do_delayed_ei = true;
    };
    instructions[0xfc] = function () {
        do_conditional_call(!!flags.S);
    };
    instructions[0xfd] = function () {
        r = (r & 0x80) | (((r & 0x7f) + 1) & 0x7f);
        pc = (pc + 1) & 0xffff;
        var opcode = core.mem_read(pc), func = dd_instructions[opcode];
        if (func) {
            var temp = ix;
            ix = iy;
            func();
            iy = ix;
            ix = temp;
            cycle_counter += cycle_counts_dd[opcode];
        }
        else {
            pc = (pc - 1) & 0xffff;
            cycle_counter += cycle_counts[0];
        }
    };
    instructions[0xfe] = function () {
        pc = (pc + 1) & 0xffff;
        do_cp(core.mem_read(pc));
    };
    instructions[0xff] = function () {
        do_reset(0x38);
    };
    let ed_instructions = [];
    ed_instructions[0x40] = function () {
        b = do_in((b << 8) | c);
    };
    ed_instructions[0x41] = function () {
        core.io_write((b << 8) | c, b);
    };
    ed_instructions[0x42] = function () {
        do_hl_sbc(c | (b << 8));
    };
    ed_instructions[0x43] = function () {
        pc = (pc + 1) & 0xffff;
        var address = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        address |= core.mem_read(pc) << 8;
        core.mem_write(address, c);
        core.mem_write((address + 1) & 0xffff, b);
    };
    ed_instructions[0x44] = function () {
        do_neg();
    };
    ed_instructions[0x45] = function () {
        pc = (pop_word() - 1) & 0xffff;
        iff1 = iff2;
    };
    ed_instructions[0x46] = function () {
        imode = 0;
    };
    ed_instructions[0x47] = function () {
        i = a;
    };
    ed_instructions[0x48] = function () {
        c = do_in((b << 8) | c);
    };
    ed_instructions[0x49] = function () {
        core.io_write((b << 8) | c, c);
    };
    ed_instructions[0x4a] = function () {
        do_hl_adc(c | (b << 8));
    };
    ed_instructions[0x4b] = function () {
        pc = (pc + 1) & 0xffff;
        var address = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        address |= core.mem_read(pc) << 8;
        c = core.mem_read(address);
        b = core.mem_read((address + 1) & 0xffff);
    };
    ed_instructions[0x4c] = function () {
        do_neg();
    };
    ed_instructions[0x4d] = function () {
        pc = (pop_word() - 1) & 0xffff;
    };
    ed_instructions[0x4e] = function () {
        imode = 0;
    };
    ed_instructions[0x4f] = function () {
        r = a;
    };
    ed_instructions[0x50] = function () {
        d = do_in((b << 8) | c);
    };
    ed_instructions[0x51] = function () {
        core.io_write((b << 8) | c, d);
    };
    ed_instructions[0x52] = function () {
        do_hl_sbc(e | (d << 8));
    };
    ed_instructions[0x53] = function () {
        pc = (pc + 1) & 0xffff;
        var address = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        address |= core.mem_read(pc) << 8;
        core.mem_write(address, e);
        core.mem_write((address + 1) & 0xffff, d);
    };
    ed_instructions[0x54] = function () {
        do_neg();
    };
    ed_instructions[0x55] = function () {
        pc = (pop_word() - 1) & 0xffff;
        iff1 = iff2;
    };
    ed_instructions[0x56] = function () {
        imode = 1;
    };
    ed_instructions[0x57] = function () {
        a = i;
        flags.S = a & 0x80 ? 1 : 0;
        flags.Z = a ? 0 : 1;
        flags.H = 0;
        flags.P = iff2;
        flags.N = 0;
        update_xy_flags(a);
    };
    ed_instructions[0x58] = function () {
        e = do_in((b << 8) | c);
    };
    ed_instructions[0x59] = function () {
        core.io_write((b << 8) | c, e);
    };
    ed_instructions[0x5a] = function () {
        do_hl_adc(e | (d << 8));
    };
    ed_instructions[0x5b] = function () {
        pc = (pc + 1) & 0xffff;
        var address = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        address |= core.mem_read(pc) << 8;
        e = core.mem_read(address);
        d = core.mem_read((address + 1) & 0xffff);
    };
    ed_instructions[0x5c] = function () {
        do_neg();
    };
    ed_instructions[0x5d] = function () {
        pc = (pop_word() - 1) & 0xffff;
        iff1 = iff2;
    };
    ed_instructions[0x5e] = function () {
        imode = 2;
    };
    ed_instructions[0x5f] = function () {
        a = r;
        flags.S = a & 0x80 ? 1 : 0;
        flags.Z = a ? 0 : 1;
        flags.H = 0;
        flags.P = iff2;
        flags.N = 0;
        update_xy_flags(a);
    };
    ed_instructions[0x60] = function () {
        h = do_in((b << 8) | c);
    };
    ed_instructions[0x61] = function () {
        core.io_write((b << 8) | c, h);
    };
    ed_instructions[0x62] = function () {
        do_hl_sbc(l | (h << 8));
    };
    ed_instructions[0x63] = function () {
        pc = (pc + 1) & 0xffff;
        var address = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        address |= core.mem_read(pc) << 8;
        core.mem_write(address, l);
        core.mem_write((address + 1) & 0xffff, h);
    };
    ed_instructions[0x64] = function () {
        do_neg();
    };
    ed_instructions[0x65] = function () {
        pc = (pop_word() - 1) & 0xffff;
        iff1 = iff2;
    };
    ed_instructions[0x66] = function () {
        imode = 0;
    };
    ed_instructions[0x67] = function () {
        var hl_value = core.mem_read(l | (h << 8));
        var temp1 = hl_value & 0x0f, temp2 = a & 0x0f;
        hl_value = ((hl_value & 0xf0) >>> 4) | (temp2 << 4);
        a = (a & 0xf0) | temp1;
        core.mem_write(l | (h << 8), hl_value);
        flags.S = (a & 0x80) ? 1 : 0;
        flags.Z = a ? 0 : 1;
        flags.H = 0;
        flags.P = get_parity(a) ? 1 : 0;
        flags.N = 0;
        update_xy_flags(a);
    };
    ed_instructions[0x68] = function () {
        l = do_in((b << 8) | c);
    };
    ed_instructions[0x69] = function () {
        core.io_write((b << 8) | c, l);
    };
    ed_instructions[0x6a] = function () {
        do_hl_adc(l | (h << 8));
    };
    ed_instructions[0x6b] = function () {
        pc = (pc + 1) & 0xffff;
        var address = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        address |= core.mem_read(pc) << 8;
        l = core.mem_read(address);
        h = core.mem_read((address + 1) & 0xffff);
    };
    ed_instructions[0x6c] = function () {
        do_neg();
    };
    ed_instructions[0x6d] = function () {
        pc = (pop_word() - 1) & 0xffff;
        iff1 = iff2;
    };
    ed_instructions[0x6e] = function () {
        imode = 0;
    };
    ed_instructions[0x6f] = function () {
        var hl_value = core.mem_read(l | (h << 8));
        var temp1 = hl_value & 0xf0, temp2 = a & 0x0f;
        hl_value = ((hl_value & 0x0f) << 4) | temp2;
        a = (a & 0xf0) | (temp1 >>> 4);
        core.mem_write(l | (h << 8), hl_value);
        flags.S = (a & 0x80) ? 1 : 0;
        flags.Z = a ? 0 : 1;
        flags.H = 0;
        flags.P = get_parity(a) ? 1 : 0;
        flags.N = 0;
        update_xy_flags(a);
    };
    ed_instructions[0x70] = function () {
        do_in((b << 8) | c);
    };
    ed_instructions[0x71] = function () {
        core.io_write((b << 8) | c, 0);
    };
    ed_instructions[0x72] = function () {
        do_hl_sbc(sp);
    };
    ed_instructions[0x73] = function () {
        pc = (pc + 1) & 0xffff;
        var address = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        address |= core.mem_read(pc) << 8;
        core.mem_write(address, sp & 0xff);
        core.mem_write((address + 1) & 0xffff, (sp >>> 8) & 0xff);
    };
    ed_instructions[0x74] = function () {
        do_neg();
    };
    ed_instructions[0x75] = function () {
        pc = (pop_word() - 1) & 0xffff;
        iff1 = iff2;
    };
    ed_instructions[0x76] = function () {
        imode = 1;
    };
    ed_instructions[0x78] = function () {
        a = do_in((b << 8) | c);
    };
    ed_instructions[0x79] = function () {
        core.io_write((b << 8) | c, a);
    };
    ed_instructions[0x7a] = function () {
        do_hl_adc(sp);
    };
    ed_instructions[0x7b] = function () {
        pc = (pc + 1) & 0xffff;
        var address = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        address |= core.mem_read(pc) << 8;
        sp = core.mem_read(address);
        sp |= core.mem_read((address + 1) & 0xffff) << 8;
    };
    ed_instructions[0x7c] = function () {
        do_neg();
    };
    ed_instructions[0x7d] = function () {
        pc = (pop_word() - 1) & 0xffff;
        iff1 = iff2;
    };
    ed_instructions[0x7e] = function () {
        imode = 2;
    };
    ed_instructions[0xa0] = function () {
        do_ldi();
    };
    ed_instructions[0xa1] = function () {
        do_cpi();
    };
    ed_instructions[0xa2] = function () {
        do_ini();
    };
    ed_instructions[0xa3] = function () {
        do_outi();
    };
    ed_instructions[0xa8] = function () {
        do_ldd();
    };
    ed_instructions[0xa9] = function () {
        do_cpd();
    };
    ed_instructions[0xaa] = function () {
        do_ind();
    };
    ed_instructions[0xab] = function () {
        do_outd();
    };
    ed_instructions[0xb0] = function () {
        do_ldi();
        if (b || c) {
            cycle_counter += 5;
            pc = (pc - 2) & 0xffff;
        }
    };
    ed_instructions[0xb1] = function () {
        do_cpi();
        if (!flags.Z && (b || c)) {
            cycle_counter += 5;
            pc = (pc - 2) & 0xffff;
        }
    };
    ed_instructions[0xb2] = function () {
        do_ini();
        if (b) {
            cycle_counter += 5;
            pc = (pc - 2) & 0xffff;
        }
    };
    ed_instructions[0xb3] = function () {
        do_outi();
        if (b) {
            cycle_counter += 5;
            pc = (pc - 2) & 0xffff;
        }
    };
    ed_instructions[0xb8] = function () {
        do_ldd();
        if (b || c) {
            cycle_counter += 5;
            pc = (pc - 2) & 0xffff;
        }
    };
    ed_instructions[0xb9] = function () {
        do_cpd();
        if (!flags.Z && (b || c)) {
            cycle_counter += 5;
            pc = (pc - 2) & 0xffff;
        }
    };
    ed_instructions[0xba] = function () {
        do_ind();
        if (b) {
            cycle_counter += 5;
            pc = (pc - 2) & 0xffff;
        }
    };
    ed_instructions[0xbb] = function () {
        do_outd();
        if (b) {
            cycle_counter += 5;
            pc = (pc - 2) & 0xffff;
        }
    };
    let dd_instructions = [];
    dd_instructions[0x09] = function () {
        do_ix_add(c | (b << 8));
    };
    dd_instructions[0x19] = function () {
        do_ix_add(e | (d << 8));
    };
    dd_instructions[0x21] = function () {
        pc = (pc + 1) & 0xffff;
        ix = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        ix |= (core.mem_read(pc) << 8);
    };
    dd_instructions[0x22] = function () {
        pc = (pc + 1) & 0xffff;
        var address = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        address |= (core.mem_read(pc) << 8);
        core.mem_write(address, ix & 0xff);
        core.mem_write((address + 1) & 0xffff, (ix >>> 8) & 0xff);
    };
    dd_instructions[0x23] = function () {
        ix = (ix + 1) & 0xffff;
    };
    dd_instructions[0x24] = function () {
        ix = (do_inc(ix >>> 8) << 8) | (ix & 0xff);
    };
    dd_instructions[0x25] = function () {
        ix = (do_dec(ix >>> 8) << 8) | (ix & 0xff);
    };
    dd_instructions[0x26] = function () {
        pc = (pc + 1) & 0xffff;
        ix = (core.mem_read(pc) << 8) | (ix & 0xff);
    };
    dd_instructions[0x29] = function () {
        do_ix_add(ix);
    };
    dd_instructions[0x2a] = function () {
        pc = (pc + 1) & 0xffff;
        var address = core.mem_read(pc);
        pc = (pc + 1) & 0xffff;
        address |= (core.mem_read(pc) << 8);
        ix = core.mem_read(address);
        ix |= (core.mem_read((address + 1) & 0xffff) << 8);
    };
    dd_instructions[0x2b] = function () {
        ix = (ix - 1) & 0xffff;
    };
    dd_instructions[0x2c] = function () {
        ix = do_inc(ix & 0xff) | (ix & 0xff00);
    };
    dd_instructions[0x2d] = function () {
        ix = do_dec(ix & 0xff) | (ix & 0xff00);
    };
    dd_instructions[0x2e] = function () {
        pc = (pc + 1) & 0xffff;
        ix = (core.mem_read(pc) & 0xff) | (ix & 0xff00);
    };
    dd_instructions[0x34] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc)), value = core.mem_read((offset + ix) & 0xffff);
        core.mem_write((offset + ix) & 0xffff, do_inc(value));
    };
    dd_instructions[0x35] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc)), value = core.mem_read((offset + ix) & 0xffff);
        core.mem_write((offset + ix) & 0xffff, do_dec(value));
    };
    dd_instructions[0x36] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        pc = (pc + 1) & 0xffff;
        core.mem_write((ix + offset) & 0xffff, core.mem_read(pc));
    };
    dd_instructions[0x39] = function () {
        do_ix_add(sp);
    };
    dd_instructions[0x44] = function () {
        b = (ix >>> 8) & 0xff;
    };
    dd_instructions[0x45] = function () {
        b = ix & 0xff;
    };
    dd_instructions[0x46] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        b = core.mem_read((ix + offset) & 0xffff);
    };
    dd_instructions[0x4c] = function () {
        c = (ix >>> 8) & 0xff;
    };
    dd_instructions[0x4d] = function () {
        c = ix & 0xff;
    };
    dd_instructions[0x4e] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        c = core.mem_read((ix + offset) & 0xffff);
    };
    dd_instructions[0x54] = function () {
        d = (ix >>> 8) & 0xff;
    };
    dd_instructions[0x55] = function () {
        d = ix & 0xff;
    };
    dd_instructions[0x56] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        d = core.mem_read((ix + offset) & 0xffff);
    };
    dd_instructions[0x5c] = function () {
        e = (ix >>> 8) & 0xff;
    };
    dd_instructions[0x5d] = function () {
        e = ix & 0xff;
    };
    dd_instructions[0x5e] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        e = core.mem_read((ix + offset) & 0xffff);
    };
    dd_instructions[0x60] = function () {
        ix = (ix & 0xff) | (b << 8);
    };
    dd_instructions[0x61] = function () {
        ix = (ix & 0xff) | (c << 8);
    };
    dd_instructions[0x62] = function () {
        ix = (ix & 0xff) | (d << 8);
    };
    dd_instructions[0x63] = function () {
        ix = (ix & 0xff) | (e << 8);
    };
    dd_instructions[0x64] = function () {
    };
    dd_instructions[0x65] = function () {
        ix = (ix & 0xff) | ((ix & 0xff) << 8);
    };
    dd_instructions[0x66] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        h = core.mem_read((ix + offset) & 0xffff);
    };
    dd_instructions[0x67] = function () {
        ix = (ix & 0xff) | (a << 8);
    };
    dd_instructions[0x68] = function () {
        ix = (ix & 0xff00) | b;
    };
    dd_instructions[0x69] = function () {
        ix = (ix & 0xff00) | c;
    };
    dd_instructions[0x6a] = function () {
        ix = (ix & 0xff00) | d;
    };
    dd_instructions[0x6b] = function () {
        ix = (ix & 0xff00) | e;
    };
    dd_instructions[0x6c] = function () {
        ix = (ix & 0xff00) | (ix >>> 8);
    };
    dd_instructions[0x6d] = function () {
    };
    dd_instructions[0x6e] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        l = core.mem_read((ix + offset) & 0xffff);
    };
    dd_instructions[0x6f] = function () {
        ix = (ix & 0xff00) | a;
    };
    dd_instructions[0x70] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        core.mem_write((ix + offset) & 0xffff, b);
    };
    dd_instructions[0x71] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        core.mem_write((ix + offset) & 0xffff, c);
    };
    dd_instructions[0x72] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        core.mem_write((ix + offset) & 0xffff, d);
    };
    dd_instructions[0x73] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        core.mem_write((ix + offset) & 0xffff, e);
    };
    dd_instructions[0x74] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        core.mem_write((ix + offset) & 0xffff, h);
    };
    dd_instructions[0x75] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        core.mem_write((ix + offset) & 0xffff, l);
    };
    dd_instructions[0x77] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        core.mem_write((ix + offset) & 0xffff, a);
    };
    dd_instructions[0x7c] = function () {
        a = (ix >>> 8) & 0xff;
    };
    dd_instructions[0x7d] = function () {
        a = ix & 0xff;
    };
    dd_instructions[0x7e] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        a = core.mem_read((ix + offset) & 0xffff);
    };
    dd_instructions[0x84] = function () {
        do_add((ix >>> 8) & 0xff);
    };
    dd_instructions[0x85] = function () {
        do_add(ix & 0xff);
    };
    dd_instructions[0x86] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        do_add(core.mem_read((ix + offset) & 0xffff));
    };
    dd_instructions[0x8c] = function () {
        do_adc((ix >>> 8) & 0xff);
    };
    dd_instructions[0x8d] = function () {
        do_adc(ix & 0xff);
    };
    dd_instructions[0x8e] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        do_adc(core.mem_read((ix + offset) & 0xffff));
    };
    dd_instructions[0x94] = function () {
        do_sub((ix >>> 8) & 0xff);
    };
    dd_instructions[0x95] = function () {
        do_sub(ix & 0xff);
    };
    dd_instructions[0x96] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        do_sub(core.mem_read((ix + offset) & 0xffff));
    };
    dd_instructions[0x9c] = function () {
        do_sbc((ix >>> 8) & 0xff);
    };
    dd_instructions[0x9d] = function () {
        do_sbc(ix & 0xff);
    };
    dd_instructions[0x9e] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        do_sbc(core.mem_read((ix + offset) & 0xffff));
    };
    dd_instructions[0xa4] = function () {
        do_and((ix >>> 8) & 0xff);
    };
    dd_instructions[0xa5] = function () {
        do_and(ix & 0xff);
    };
    dd_instructions[0xa6] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        do_and(core.mem_read((ix + offset) & 0xffff));
    };
    dd_instructions[0xac] = function () {
        do_xor((ix >>> 8) & 0xff);
    };
    dd_instructions[0xad] = function () {
        do_xor(ix & 0xff);
    };
    dd_instructions[0xae] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        do_xor(core.mem_read((ix + offset) & 0xffff));
    };
    dd_instructions[0xb4] = function () {
        do_or((ix >>> 8) & 0xff);
    };
    dd_instructions[0xb5] = function () {
        do_or(ix & 0xff);
    };
    dd_instructions[0xb6] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        do_or(core.mem_read((ix + offset) & 0xffff));
    };
    dd_instructions[0xbc] = function () {
        do_cp((ix >>> 8) & 0xff);
    };
    dd_instructions[0xbd] = function () {
        do_cp(ix & 0xff);
    };
    dd_instructions[0xbe] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        do_cp(core.mem_read((ix + offset) & 0xffff));
    };
    dd_instructions[0xcb] = function () {
        pc = (pc + 1) & 0xffff;
        var offset = get_signed_offset_byte(core.mem_read(pc));
        pc = (pc + 1) & 0xffff;
        var opcode = core.mem_read(pc), value;
        if (opcode < 0x40) {
            var ddcb_functions = [do_rlc, do_rrc, do_rl, do_rr,
                do_sla, do_sra, do_sll, do_srl];
            var func = ddcb_functions[(opcode & 0x38) >>> 3], value = func(core.mem_read((ix + offset) & 0xffff));
            core.mem_write((ix + offset) & 0xffff, value);
        }
        else {
            var bit_number = (opcode & 0x38) >>> 3;
            if (opcode < 0x80) {
                flags.N = 0;
                flags.H = 1;
                flags.Z = !(core.mem_read((ix + offset) & 0xffff) & (1 << bit_number)) ? 1 : 0;
                flags.P = flags.Z;
                flags.S = ((bit_number === 7) && !flags.Z) ? 1 : 0;
            }
            else if (opcode < 0xc0) {
                value = core.mem_read((ix + offset) & 0xffff) & ~(1 << bit_number) & 0xff;
                core.mem_write((ix + offset) & 0xffff, value);
            }
            else {
                value = core.mem_read((ix + offset) & 0xffff) | (1 << bit_number);
                core.mem_write((ix + offset) & 0xffff, value);
            }
        }
        if (value !== undefined) {
            if ((opcode & 0x07) === 0)
                b = value;
            else if ((opcode & 0x07) === 1)
                c = value;
            else if ((opcode & 0x07) === 2)
                d = value;
            else if ((opcode & 0x07) === 3)
                e = value;
            else if ((opcode & 0x07) === 4)
                h = value;
            else if ((opcode & 0x07) === 5)
                l = value;
            else if ((opcode & 0x07) === 7)
                a = value;
        }
        cycle_counter += cycle_counts_cb[opcode] + 8;
    };
    dd_instructions[0xe1] = function () {
        ix = pop_word();
    };
    dd_instructions[0xe3] = function () {
        var temp = ix;
        ix = core.mem_read(sp);
        ix |= core.mem_read((sp + 1) & 0xffff) << 8;
        core.mem_write(sp, temp & 0xff);
        core.mem_write((sp + 1) & 0xffff, (temp >>> 8) & 0xff);
    };
    dd_instructions[0xe5] = function () {
        push_word(ix);
    };
    dd_instructions[0xe9] = function () {
        pc = (ix - 1) & 0xffff;
    };
    dd_instructions[0xf9] = function () {
        sp = ix;
    };
    let cycle_counts = [
        4, 10, 7, 6, 4, 4, 7, 4, 4, 11, 7, 6, 4, 4, 7, 4,
        8, 10, 7, 6, 4, 4, 7, 4, 12, 11, 7, 6, 4, 4, 7, 4,
        7, 10, 16, 6, 4, 4, 7, 4, 7, 11, 16, 6, 4, 4, 7, 4,
        7, 10, 13, 6, 11, 11, 10, 4, 7, 11, 13, 6, 4, 4, 7, 4,
        4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
        4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
        4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
        7, 7, 7, 7, 7, 7, 4, 7, 4, 4, 4, 4, 4, 4, 7, 4,
        4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
        4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
        4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
        4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
        5, 10, 10, 10, 10, 11, 7, 11, 5, 10, 10, 0, 10, 17, 7, 11,
        5, 10, 10, 11, 10, 11, 7, 11, 5, 4, 10, 11, 10, 0, 7, 11,
        5, 10, 10, 19, 10, 11, 7, 11, 5, 4, 10, 4, 10, 0, 7, 11,
        5, 10, 10, 4, 10, 11, 7, 11, 5, 6, 10, 4, 10, 0, 7, 11
    ];
    let cycle_counts_ed = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        12, 12, 15, 20, 8, 14, 8, 9, 12, 12, 15, 20, 8, 14, 8, 9,
        12, 12, 15, 20, 8, 14, 8, 9, 12, 12, 15, 20, 8, 14, 8, 9,
        12, 12, 15, 20, 8, 14, 8, 18, 12, 12, 15, 20, 8, 14, 8, 18,
        12, 12, 15, 20, 8, 14, 8, 0, 12, 12, 15, 20, 8, 14, 8, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        16, 16, 16, 16, 0, 0, 0, 0, 16, 16, 16, 16, 0, 0, 0, 0,
        16, 16, 16, 16, 0, 0, 0, 0, 16, 16, 16, 16, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];
    let cycle_counts_cb = [
        8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
        8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
        8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
        8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
        8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
        8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
        8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
        8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
        8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
        8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
        8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
        8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
        8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
        8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
        8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
        8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8
    ];
    let cycle_counts_dd = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0,
        0, 14, 20, 10, 8, 8, 11, 0, 0, 15, 20, 10, 8, 8, 11, 0,
        0, 0, 0, 0, 23, 23, 19, 0, 0, 15, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 8, 8, 19, 0, 0, 0, 0, 0, 8, 8, 19, 0,
        0, 0, 0, 0, 8, 8, 19, 0, 0, 0, 0, 0, 8, 8, 19, 0,
        8, 8, 8, 8, 8, 8, 19, 8, 8, 8, 8, 8, 8, 8, 19, 8,
        19, 19, 19, 19, 19, 19, 0, 19, 0, 0, 0, 0, 8, 8, 19, 0,
        0, 0, 0, 0, 8, 8, 19, 0, 0, 0, 0, 0, 8, 8, 19, 0,
        0, 0, 0, 0, 8, 8, 19, 0, 0, 0, 0, 0, 8, 8, 19, 0,
        0, 0, 0, 0, 8, 8, 19, 0, 0, 0, 0, 0, 8, 8, 19, 0,
        0, 0, 0, 0, 8, 8, 19, 0, 0, 0, 0, 0, 8, 8, 19, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 14, 0, 23, 0, 15, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0
    ];
    return {
        getState,
        setState,
        reset,
        run_instruction,
        interrupt
    };
}
export class ExidyZ80 {
    constructor(memory, input, output) {
        this.cpu = Z80({
            mem_read: (address) => { return memory.readByte(address); },
            mem_write: (address, data) => { memory.writeByte(address, data); },
            io_read: (address) => { return input.readByte(address); },
            io_write: (address, data) => { output.writeByte(address, data); }
        });
    }
    reset(address) {
        this.cpu.reset(address);
        if (address) {
            const state = this.cpu.getState();
            state.pc = address;
            this.cpu.setState(state);
        }
    }
    executeInstruction() {
        return this.cpu.run_instruction();
    }
    interrupt(non_maskable, value) {
        this.cpu.interrupt(non_maskable, value);
    }
    load(data) {
        const flags = data[20];
        const flags_prime = 0x00;
        this.cpu.setState({
            i: data[0],
            l_prime: data[1],
            h_prime: data[2],
            e_prime: data[3],
            d_prime: data[4],
            c_prime: data[5],
            b_prime: data[6],
            f_prime: data[7],
            a_prime: data[8],
            l: data[9],
            h: data[10],
            e: data[11],
            d: data[12],
            c: data[13],
            b: data[14],
            iy: data[15] | (data[16] << 8),
            ix: data[17] | (data[18] << 8),
            iff2: (data[19] & 0x04) !== 0 ? 1 : 0,
            iff1: (data[19] & 0x02) !== 0 ? 1 : 0,
            r: data[20],
            f: data[21],
            a: data[22],
            sp: data[23] | (data[24] << 8),
            imode: data[25],
            pc: data[26] | (data[27] << 8),
            flags: {
                S: (flags & 0x80) >>> 7,
                Z: (flags & 0x40) >>> 6,
                Y: (flags & 0x20) >>> 5,
                H: (flags & 0x10) >>> 4,
                X: (flags & 0x08) >>> 3,
                P: (flags & 0x04) >>> 2,
                N: (flags & 0x02) >>> 1,
                C: (flags & 0x01)
            },
            flags_prime: {
                S: (flags_prime & 0x80) >>> 7,
                Z: (flags_prime & 0x40) >>> 6,
                Y: (flags_prime & 0x20) >>> 5,
                H: (flags_prime & 0x10) >>> 4,
                X: (flags_prime & 0x08) >>> 3,
                P: (flags_prime & 0x04) >>> 2,
                N: (flags_prime & 0x02) >>> 1,
                C: (flags_prime & 0x01)
            },
            halted: false,
            do_delayed_di: false,
            do_delayed_ei: false,
            cycle_counter: 0
        });
    }
}
