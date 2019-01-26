'use strict';
function Z80(core) {
    if (!core || (typeof core.mem_read !== 'function') || (typeof core.mem_write !== 'function') ||
        (typeof core.io_read !== 'function') || (typeof core.io_write !== 'function'))
        throw ('Z80: Core object is missing required functions.');
    if (this === window)
        throw ('Z80: This function is a constructor; call it using operator new.');
    this.core = core;
    this.a = 0x00;
    this.b = 0x00;
    this.c = 0x00;
    this.d = 0x00;
    this.e = 0x00;
    this.h = 0x00;
    this.l = 0x00;
    this.a_prime = 0x00;
    this.b_prime = 0x00;
    this.c_prime = 0x00;
    this.d_prime = 0x00;
    this.e_prime = 0x00;
    this.h_prime = 0x00;
    this.l_prime = 0x00;
    this.ix = 0x0000;
    this.iy = 0x0000;
    this.i = 0x00;
    this.r = 0x00;
    this.sp = 0xdff0;
    this.pc = 0x0000;
    this.flags = { S: 0, Z: 0, Y: 0, H: 0, X: 0, P: 0, N: 0, C: 0 };
    this.flags_prime = { S: 0, Z: 0, Y: 0, H: 0, X: 0, P: 0, N: 0, C: 0 };
    this.imode = 0;
    this.iff1 = 0;
    this.iff2 = 0;
    this.halted = false;
    this.do_delayed_di = false;
    this.do_delayed_ei = false;
    this.cycle_counter = 0;
    this.api = {
        reset: this.reset.bind(this),
        run_instruction: this.run_instruction.bind(this),
        interrupt: this.interrupt.bind(this),
        load: this.load.bind(this)
    };
}
Z80.prototype.load = function (state) {
    this.reset();
    this.i = state.i;
    this.a_prime = state.a_prime;
    this.b_prime = state.b_prime;
    this.c_prime = state.c_prime;
    this.d_prime = state.d_prime;
    this.e_prime = state.e_prime;
    this.h_prime = state.h_prime;
    this.l_prime = state.l_prime;
    this.set_flags_prime(state.f_prime);
    this.a = state.a;
    this.b = state.b;
    this.c = state.c;
    this.d = state.d;
    this.e = state.e;
    this.h = state.h;
    this.l = state.l;
    this.ix = state.ix;
    this.iy = state.iy;
    this.iff1 = state.iff1;
    this.iff2 = state.iff2;
    this.set_flags_register(state.f);
    this.r = state.r;
    this.imode = state.imode;
    this.pc = state.pc;
    this.sp = state.sp;
};
Z80.prototype.reset = function (pc) {
    this.sp = 0xdff0;
    this.pc = typeof pc === 'undefined' ? 0x000 : pc;
    this.a = 0x00;
    this.r = 0x00;
    this.set_flags_register(0);
    this.imode = 0;
    this.iff1 = 0;
    this.iff2 = 0;
    this.halted = false;
    this.do_delayed_di = false;
    this.do_delayed_ei = false;
    this.cycle_counter = 0;
};
Z80.prototype.run_instruction = function () {
    if (!this.halted) {
        let doing_delayed_di = false, doing_delayed_ei = false;
        if (this.do_delayed_di) {
            this.do_delayed_di = false;
            doing_delayed_di = true;
        }
        else if (this.do_delayed_ei) {
            this.do_delayed_ei = false;
            doing_delayed_ei = true;
        }
        this.r = (this.r & 0x80) | (((this.r & 0x7f) + 1) & 0x7f);
        let opcode = this.core.mem_read(this.pc);
        this.decode_instruction(opcode);
        this.pc = (this.pc + 1) & 0xffff;
        if (doing_delayed_di) {
            this.iff1 = 0;
            this.iff2 = 0;
        }
        else if (doing_delayed_ei) {
            this.iff1 = 1;
            this.iff2 = 1;
        }
        let retval = this.cycle_counter;
        this.cycle_counter = 0;
        return retval;
    }
    else {
        return 1;
    }
};
Z80.prototype.interrupt = function (non_maskable, data) {
    if (non_maskable) {
        this.r = (this.r & 0x80) | (((this.r & 0x7f) + 1) & 0x7f);
        this.halted = false;
        this.iff2 = this.iff1;
        this.iff1 = 0;
        this.push_word(this.pc);
        this.pc = 0x66;
        this.cycle_counter += 11;
    }
    else if (this.iff1) {
        this.r = (this.r & 0x80) | (((this.r & 0x7f) + 1) & 0x7f);
        this.halted = false;
        this.iff1 = 0;
        this.iff2 = 0;
        if (this.imode === 0) {
            this.decode_instruction(data);
            this.cycle_counter += 2;
        }
        else if (this.imode === 1) {
            this.push_word(this.pc);
            this.pc = 0x38;
            this.cycle_counter += 13;
        }
        else if (this.imode === 2) {
            this.push_word(this.pc);
            let vector_address = ((this.i << 8) | data);
            this.pc = this.core.mem_read(vector_address) |
                (this.core.mem_read((vector_address + 1) & 0xffff) << 8);
            this.cycle_counter += 19;
        }
    }
};
let get_operand = function (opcode) {
    let opcodeLowerBits = opcode & 0x07;
    return (opcodeLowerBits === 0) ? this.b :
        (opcodeLowerBits === 1) ? this.c :
            (opcodeLowerBits === 2) ? this.d :
                (opcodeLowerBits === 3) ? this.e :
                    (opcodeLowerBits === 4) ? this.h :
                        (opcodeLowerBits === 5) ? this.l :
                            (opcodeLowerBits === 6) ? this.core.mem_read(this.l | (this.h << 8)) : this.a;
};
Z80.prototype.decode_instruction = function (opcode) {
    if (opcode === 0x76) {
        this.halted = true;
    }
    else if ((opcode >= 0x40) && (opcode < 0x80)) {
        let operand = get_operand.call(this, opcode);
        let operandShifted = (opcode & 0x38) >>> 3;
        if (operandShifted === 0)
            this.b = operand;
        else if (operandShifted === 1)
            this.c = operand;
        else if (operandShifted === 2)
            this.d = operand;
        else if (operandShifted === 3)
            this.e = operand;
        else if (operandShifted === 4)
            this.h = operand;
        else if (operandShifted === 5)
            this.l = operand;
        else if (operandShifted === 6)
            this.core.mem_write(this.l | (this.h << 8), operand);
        else if (operandShifted === 7)
            this.a = operand;
    }
    else if ((opcode >= 0x80) && (opcode < 0xc0)) {
        let operand = get_operand.call(this, opcode);
        const op_array = [this.do_add, this.do_adc, this.do_sub, this.do_sbc,
            this.do_and, this.do_xor, this.do_or, this.do_cp];
        op_array[(opcode & 0x38) >>> 3].call(this, operand);
    }
    else {
        let func = this.instructions[opcode].bind(this);
        func();
    }
    this.cycle_counter += this.cycle_counts[opcode];
};
Z80.prototype.get_signed_offset_byte = function (value) {
    value &= 0xff;
    if (value & 0x80) {
        value = -((0xff & ~value) + 1);
    }
    return value;
};
Z80.prototype.get_flags_register = function () {
    return (this.flags.S << 7) |
        (this.flags.Z << 6) |
        (this.flags.Y << 5) |
        (this.flags.H << 4) |
        (this.flags.X << 3) |
        (this.flags.P << 2) |
        (this.flags.N << 1) |
        (this.flags.C);
};
Z80.prototype.get_flags_prime = function () {
    return (this.flags_prime.S << 7) |
        (this.flags_prime.Z << 6) |
        (this.flags_prime.Y << 5) |
        (this.flags_prime.H << 4) |
        (this.flags_prime.X << 3) |
        (this.flags_prime.P << 2) |
        (this.flags_prime.N << 1) |
        (this.flags_prime.C);
};
Z80.prototype.set_flags_register = function (operand) {
    this.flags.S = (operand & 0x80) >>> 7;
    this.flags.Z = (operand & 0x40) >>> 6;
    this.flags.Y = (operand & 0x20) >>> 5;
    this.flags.H = (operand & 0x10) >>> 4;
    this.flags.X = (operand & 0x08) >>> 3;
    this.flags.P = (operand & 0x04) >>> 2;
    this.flags.N = (operand & 0x02) >>> 1;
    this.flags.C = (operand & 0x01);
};
Z80.prototype.set_flags_prime = function (operand) {
    this.flags_prime.S = (operand & 0x80) >>> 7;
    this.flags_prime.Z = (operand & 0x40) >>> 6;
    this.flags_prime.Y = (operand & 0x20) >>> 5;
    this.flags_prime.H = (operand & 0x10) >>> 4;
    this.flags_prime.X = (operand & 0x08) >>> 3;
    this.flags_prime.P = (operand & 0x04) >>> 2;
    this.flags_prime.N = (operand & 0x02) >>> 1;
    this.flags_prime.C = (operand & 0x01);
};
Z80.prototype.update_xy_flags = function (result) {
    this.flags.Y = (result & 0x20) >>> 5;
    this.flags.X = (result & 0x08) >>> 3;
};
Z80.prototype.get_parity = function (value) {
    let parity_bits = [
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
Z80.prototype.push_word = function (operand) {
    this.sp = (this.sp - 1) & 0xffff;
    this.core.mem_write(this.sp, (operand & 0xff00) >>> 8);
    this.sp = (this.sp - 1) & 0xffff;
    this.core.mem_write(this.sp, operand & 0x00ff);
};
Z80.prototype.pop_word = function () {
    let retval = this.core.mem_read(this.sp) & 0xff;
    this.sp = (this.sp + 1) & 0xffff;
    retval |= this.core.mem_read(this.sp) << 8;
    this.sp = (this.sp + 1) & 0xffff;
    return retval;
};
Z80.prototype.do_conditional_absolute_jump = function (condition) {
    if (condition) {
        this.pc = this.core.mem_read((this.pc + 1) & 0xffff) |
            (this.core.mem_read((this.pc + 2) & 0xffff) << 8);
        this.pc = (this.pc - 1) & 0xffff;
    }
    else {
        this.pc = (this.pc + 2) & 0xffff;
    }
};
Z80.prototype.do_conditional_relative_jump = function (condition) {
    if (condition) {
        this.cycle_counter += 5;
        let offset = this.get_signed_offset_byte(this.core.mem_read((this.pc + 1) & 0xffff));
        this.pc = (this.pc + offset + 1) & 0xffff;
    }
    else {
        this.pc = (this.pc + 1) & 0xffff;
    }
};
Z80.prototype.do_conditional_call = function (condition) {
    if (condition) {
        this.cycle_counter += 7;
        this.push_word((this.pc + 3) & 0xffff);
        this.pc = this.core.mem_read((this.pc + 1) & 0xffff) |
            (this.core.mem_read((this.pc + 2) & 0xffff) << 8);
        this.pc = (this.pc - 1) & 0xffff;
    }
    else {
        this.pc = (this.pc + 2) & 0xffff;
    }
};
Z80.prototype.do_conditional_return = function (condition) {
    if (condition) {
        this.cycle_counter += 6;
        this.pc = (this.pop_word() - 1) & 0xffff;
    }
};
Z80.prototype.do_reset = function (address) {
    this.push_word((this.pc + 1) & 0xffff);
    this.pc = (address - 1) & 0xffff;
};
Z80.prototype.do_add = function (operand) {
    let result = this.a + operand;
    this.flags.S = (result & 0x80) ? 1 : 0;
    this.flags.Z = !(result & 0xff) ? 1 : 0;
    this.flags.H = (((operand & 0x0f) + (this.a & 0x0f)) & 0x10) ? 1 : 0;
    this.flags.P = ((this.a & 0x80) === (operand & 0x80)) && ((this.a & 0x80) !== (result & 0x80)) ? 1 : 0;
    this.flags.N = 0;
    this.flags.C = (result & 0x100) ? 1 : 0;
    this.a = result & 0xff;
    this.update_xy_flags(this.a);
};
Z80.prototype.do_adc = function (operand) {
    let result = this.a + operand + this.flags.C;
    this.flags.S = (result & 0x80) ? 1 : 0;
    this.flags.Z = !(result & 0xff) ? 1 : 0;
    this.flags.H = (((operand & 0x0f) + (this.a & 0x0f) + this.flags.C) & 0x10) ? 1 : 0;
    this.flags.P = ((this.a & 0x80) === (operand & 0x80)) && ((this.a & 0x80) !== (result & 0x80)) ? 1 : 0;
    this.flags.N = 0;
    this.flags.C = (result & 0x100) ? 1 : 0;
    this.a = result & 0xff;
    this.update_xy_flags(this.a);
};
Z80.prototype.do_sub = function (operand) {
    let result = this.a - operand;
    this.flags.S = (result & 0x80) ? 1 : 0;
    this.flags.Z = !(result & 0xff) ? 1 : 0;
    this.flags.H = (((this.a & 0x0f) - (operand & 0x0f)) & 0x10) ? 1 : 0;
    this.flags.P = ((this.a & 0x80) !== (operand & 0x80)) && ((this.a & 0x80) !== (result & 0x80)) ? 1 : 0;
    this.flags.N = 1;
    this.flags.C = (result & 0x100) ? 1 : 0;
    this.a = result & 0xff;
    this.update_xy_flags(this.a);
};
Z80.prototype.do_sbc = function (operand) {
    let result = this.a - operand - this.flags.C;
    this.flags.S = (result & 0x80) ? 1 : 0;
    this.flags.Z = !(result & 0xff) ? 1 : 0;
    this.flags.H = (((this.a & 0x0f) - (operand & 0x0f) - this.flags.C) & 0x10) ? 1 : 0;
    this.flags.P = ((this.a & 0x80) !== (operand & 0x80)) && ((this.a & 0x80) !== (result & 0x80)) ? 1 : 0;
    this.flags.N = 1;
    this.flags.C = (result & 0x100) ? 1 : 0;
    this.a = result & 0xff;
    this.update_xy_flags(this.a);
};
Z80.prototype.do_cp = function (operand) {
    let temp = this.a;
    this.do_sub(operand);
    this.a = temp;
    this.update_xy_flags(operand);
};
Z80.prototype.do_and = function (operand) {
    this.a &= operand & 0xff;
    this.flags.S = (this.a & 0x80) ? 1 : 0;
    this.flags.Z = !this.a ? 1 : 0;
    this.flags.H = 1;
    this.flags.P = this.get_parity(this.a);
    this.flags.N = 0;
    this.flags.C = 0;
    this.update_xy_flags(this.a);
};
Z80.prototype.do_or = function (operand) {
    this.a = (operand | this.a) & 0xff;
    this.flags.S = (this.a & 0x80) ? 1 : 0;
    this.flags.Z = !this.a ? 1 : 0;
    this.flags.H = 0;
    this.flags.P = this.get_parity(this.a);
    this.flags.N = 0;
    this.flags.C = 0;
    this.update_xy_flags(this.a);
};
Z80.prototype.do_xor = function (operand) {
    this.a = (operand ^ this.a) & 0xff;
    this.flags.S = (this.a & 0x80) ? 1 : 0;
    this.flags.Z = !this.a ? 1 : 0;
    this.flags.H = 0;
    this.flags.P = this.get_parity(this.a);
    this.flags.N = 0;
    this.flags.C = 0;
    this.update_xy_flags(this.a);
};
Z80.prototype.do_inc = function (operand) {
    let result = operand + 1;
    this.flags.S = (result & 0x80) ? 1 : 0;
    this.flags.Z = !(result & 0xff) ? 1 : 0;
    this.flags.H = ((operand & 0x0f) === 0x0f) ? 1 : 0;
    this.flags.P = (operand === 0x7f) ? 1 : 0;
    this.flags.N = 0;
    result &= 0xff;
    this.update_xy_flags(result);
    return result;
};
Z80.prototype.do_dec = function (operand) {
    let result = operand - 1;
    this.flags.S = (result & 0x80) ? 1 : 0;
    this.flags.Z = !(result & 0xff) ? 1 : 0;
    this.flags.H = ((operand & 0x0f) === 0x00) ? 1 : 0;
    this.flags.P = (operand === 0x80) ? 1 : 0;
    this.flags.N = 1;
    result &= 0xff;
    this.update_xy_flags(result);
    return result;
};
Z80.prototype.do_hl_add = function (operand) {
    let hl = this.l | (this.h << 8), result = hl + operand;
    this.flags.N = 0;
    this.flags.C = (result & 0x10000) ? 1 : 0;
    this.flags.H = (((hl & 0x0fff) + (operand & 0x0fff)) & 0x1000) ? 1 : 0;
    this.l = result & 0xff;
    this.h = (result & 0xff00) >>> 8;
    this.update_xy_flags(this.h);
};
Z80.prototype.do_hl_adc = function (operand) {
    operand += this.flags.C;
    let hl = this.l | (this.h << 8), result = hl + operand;
    this.flags.S = (result & 0x8000) ? 1 : 0;
    this.flags.Z = !(result & 0xffff) ? 1 : 0;
    this.flags.H = (((hl & 0x0fff) + (operand & 0x0fff)) & 0x1000) ? 1 : 0;
    this.flags.P = ((hl & 0x8000) === (operand & 0x8000)) && ((result & 0x8000) !== (hl & 0x8000)) ? 1 : 0;
    this.flags.N = 0;
    this.flags.C = (result & 0x10000) ? 1 : 0;
    this.l = result & 0xff;
    this.h = (result >>> 8) & 0xff;
    this.update_xy_flags(this.h);
};
Z80.prototype.do_hl_sbc = function (operand) {
    operand += this.flags.C;
    let hl = this.l | (this.h << 8), result = hl - operand;
    this.flags.S = (result & 0x8000) ? 1 : 0;
    this.flags.Z = !(result & 0xffff) ? 1 : 0;
    this.flags.H = (((hl & 0x0fff) - (operand & 0x0fff)) & 0x1000) ? 1 : 0;
    this.flags.P = ((hl & 0x8000) !== (operand & 0x8000)) && ((result & 0x8000) !== (hl & 0x8000)) ? 1 : 0;
    this.flags.N = 1;
    this.flags.C = (result & 0x10000) ? 1 : 0;
    this.l = result & 0xff;
    this.h = (result >>> 8) & 0xff;
    this.update_xy_flags(this.h);
};
Z80.prototype.do_in = function (port) {
    let result = this.core.io_read(port);
    this.flags.S = (result & 0x80) ? 1 : 0;
    this.flags.Z = result ? 0 : 1;
    this.flags.H = 0;
    this.flags.P = this.get_parity(result) ? 1 : 0;
    this.flags.N = 0;
    this.update_xy_flags(result);
    return result;
};
Z80.prototype.do_neg = function () {
    if (this.a !== 0x80) {
        this.a = this.get_signed_offset_byte(this.a);
        this.a = (-this.a) & 0xff;
    }
    this.flags.S = (this.a & 0x80) ? 1 : 0;
    this.flags.Z = !this.a ? 1 : 0;
    this.flags.H = (((-this.a) & 0x0f) > 0) ? 1 : 0;
    this.flags.P = (this.a === 0x80) ? 1 : 0;
    this.flags.N = 1;
    this.flags.C = this.a ? 1 : 0;
    this.update_xy_flags(this.a);
};
Z80.prototype.do_ldi = function () {
    let read_value = this.core.mem_read(this.l | (this.h << 8));
    this.core.mem_write(this.e | (this.d << 8), read_value);
    let result = (this.e | (this.d << 8)) + 1;
    this.e = result & 0xff;
    this.d = (result & 0xff00) >>> 8;
    result = (this.l | (this.h << 8)) + 1;
    this.l = result & 0xff;
    this.h = (result & 0xff00) >>> 8;
    result = (this.c | (this.b << 8)) - 1;
    this.c = result & 0xff;
    this.b = (result & 0xff00) >>> 8;
    this.flags.H = 0;
    this.flags.P = (this.c || this.b) ? 1 : 0;
    this.flags.N = 0;
    this.flags.Y = ((this.a + read_value) & 0x02) >>> 1;
    this.flags.X = ((this.a + read_value) & 0x08) >>> 3;
};
Z80.prototype.do_cpi = function () {
    let temp_carry = this.flags.C;
    let read_value = this.core.mem_read(this.l | (this.h << 8));
    this.do_cp(read_value);
    this.flags.C = temp_carry;
    this.flags.Y = ((this.a - read_value - this.flags.H) & 0x02) >>> 1;
    this.flags.X = ((this.a - read_value - this.flags.H) & 0x08) >>> 3;
    let result = (this.l | (this.h << 8)) + 1;
    this.l = result & 0xff;
    this.h = (result & 0xff00) >>> 8;
    result = (this.c | (this.b << 8)) - 1;
    this.c = result & 0xff;
    this.b = (result & 0xff00) >>> 8;
    this.flags.P = result ? 1 : 0;
};
Z80.prototype.do_ini = function () {
    this.b = this.do_dec(this.b);
    this.core.mem_write(this.l | (this.h << 8), this.core.io_read((this.b << 8) | this.c));
    let result = (this.l | (this.h << 8)) + 1;
    this.l = result & 0xff;
    this.h = (result & 0xff00) >>> 8;
    this.flags.N = 1;
};
Z80.prototype.do_outi = function () {
    this.core.io_write((this.b << 8) | this.c, this.core.mem_read(this.l | (this.h << 8)));
    let result = (this.l | (this.h << 8)) + 1;
    this.l = result & 0xff;
    this.h = (result & 0xff00) >>> 8;
    this.b = this.do_dec(this.b);
    this.flags.N = 1;
};
Z80.prototype.do_ldd = function () {
    this.flags.N = 0;
    this.flags.H = 0;
    let read_value = this.core.mem_read(this.l | (this.h << 8));
    this.core.mem_write(this.e | (this.d << 8), read_value);
    let result = (this.e | (this.d << 8)) - 1;
    this.e = result & 0xff;
    this.d = (result & 0xff00) >>> 8;
    result = (this.l | (this.h << 8)) - 1;
    this.l = result & 0xff;
    this.h = (result & 0xff00) >>> 8;
    result = (this.c | (this.b << 8)) - 1;
    this.c = result & 0xff;
    this.b = (result & 0xff00) >>> 8;
    this.flags.P = (this.c || this.b) ? 1 : 0;
    this.flags.Y = ((this.a + read_value) & 0x02) >>> 1;
    this.flags.X = ((this.a + read_value) & 0x08) >>> 3;
};
Z80.prototype.do_cpd = function () {
    let temp_carry = this.flags.C;
    let read_value = this.core.mem_read(this.l | (this.h << 8));
    this.do_cp(read_value);
    this.flags.C = temp_carry;
    this.flags.Y = ((this.a - read_value - this.flags.H) & 0x02) >>> 1;
    this.flags.X = ((this.a - read_value - this.flags.H) & 0x08) >>> 3;
    let result = (this.l | (this.h << 8)) - 1;
    this.l = result & 0xff;
    this.h = (result & 0xff00) >>> 8;
    result = (this.c | (this.b << 8)) - 1;
    this.c = result & 0xff;
    this.b = (result & 0xff00) >>> 8;
    this.flags.P = result ? 1 : 0;
};
Z80.prototype.do_ind = function () {
    this.b = this.do_dec(this.b);
    this.core.mem_write(this.l | (this.h << 8), this.core.io_read((this.b << 8) | this.c));
    let result = (this.l | (this.h << 8)) - 1;
    this.l = result & 0xff;
    this.h = (result & 0xff00) >>> 8;
    this.flags.N = 1;
};
Z80.prototype.do_outd = function () {
    this.core.io_write((this.b << 8) | this.c, this.core.mem_read(this.l | (this.h << 8)));
    let result = (this.l | (this.h << 8)) - 1;
    this.l = result & 0xff;
    this.h = (result & 0xff00) >>> 8;
    this.b = this.do_dec(this.b);
    this.flags.N = 1;
};
Z80.prototype.do_rlc = function (operand) {
    this.flags.N = 0;
    this.flags.H = 0;
    this.flags.C = (operand & 0x80) >>> 7;
    operand = ((operand << 1) | this.flags.C) & 0xff;
    this.flags.Z = !operand ? 1 : 0;
    this.flags.P = this.get_parity(operand);
    this.flags.S = (operand & 0x80) ? 1 : 0;
    this.update_xy_flags(operand);
    return operand;
};
Z80.prototype.do_rrc = function (operand) {
    this.flags.N = 0;
    this.flags.H = 0;
    this.flags.C = operand & 1;
    operand = ((operand >>> 1) & 0x7f) | (this.flags.C << 7);
    this.flags.Z = !(operand & 0xff) ? 1 : 0;
    this.flags.P = this.get_parity(operand);
    this.flags.S = (operand & 0x80) ? 1 : 0;
    this.update_xy_flags(operand);
    return operand & 0xff;
};
Z80.prototype.do_rl = function (operand) {
    this.flags.N = 0;
    this.flags.H = 0;
    let temp = this.flags.C;
    this.flags.C = (operand & 0x80) >>> 7;
    operand = ((operand << 1) | temp) & 0xff;
    this.flags.Z = !operand ? 1 : 0;
    this.flags.P = this.get_parity(operand);
    this.flags.S = (operand & 0x80) ? 1 : 0;
    this.update_xy_flags(operand);
    return operand;
};
Z80.prototype.do_rr = function (operand) {
    this.flags.N = 0;
    this.flags.H = 0;
    let temp = this.flags.C;
    this.flags.C = operand & 1;
    operand = ((operand >>> 1) & 0x7f) | (temp << 7);
    this.flags.Z = !operand ? 1 : 0;
    this.flags.P = this.get_parity(operand);
    this.flags.S = (operand & 0x80) ? 1 : 0;
    this.update_xy_flags(operand);
    return operand;
};
Z80.prototype.do_sla = function (operand) {
    this.flags.N = 0;
    this.flags.H = 0;
    this.flags.C = (operand & 0x80) >>> 7;
    operand = (operand << 1) & 0xff;
    this.flags.Z = !operand ? 1 : 0;
    this.flags.P = this.get_parity(operand);
    this.flags.S = (operand & 0x80) ? 1 : 0;
    this.update_xy_flags(operand);
    return operand;
};
Z80.prototype.do_sra = function (operand) {
    this.flags.N = 0;
    this.flags.H = 0;
    this.flags.C = operand & 1;
    operand = ((operand >>> 1) & 0x7f) | (operand & 0x80);
    this.flags.Z = !operand ? 1 : 0;
    this.flags.P = this.get_parity(operand);
    this.flags.S = (operand & 0x80) ? 1 : 0;
    this.update_xy_flags(operand);
    return operand;
};
Z80.prototype.do_sll = function (operand) {
    this.flags.N = 0;
    this.flags.H = 0;
    this.flags.C = (operand & 0x80) >>> 7;
    operand = ((operand << 1) & 0xff) | 1;
    this.flags.Z = !operand ? 1 : 0;
    this.flags.P = this.get_parity(operand);
    this.flags.S = (operand & 0x80) ? 1 : 0;
    this.update_xy_flags(operand);
    return operand;
};
Z80.prototype.do_srl = function (operand) {
    this.flags.N = 0;
    this.flags.H = 0;
    this.flags.C = operand & 1;
    operand = (operand >>> 1) & 0x7f;
    this.flags.Z = !operand ? 1 : 0;
    this.flags.P = this.get_parity(operand);
    this.flags.S = 0;
    this.update_xy_flags(operand);
    return operand;
};
Z80.prototype.do_ix_add = function (operand) {
    this.flags.N = 0;
    let result = this.ix + operand;
    this.flags.C = (result & 0x10000) ? 1 : 0;
    this.flags.H = (((this.ix & 0xfff) + (operand & 0xfff)) & 0x1000) ? 1 : 0;
    this.update_xy_flags((result & 0xff00) >>> 8);
    this.ix = result;
};
Z80.prototype.instructions = [];
Z80.prototype.instructions[0x00] = function () { };
Z80.prototype.instructions[0x01] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.c = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    this.b = this.core.mem_read(this.pc);
};
Z80.prototype.instructions[0x02] = function () {
    this.core.mem_write(this.c | (this.b << 8), this.a);
};
Z80.prototype.instructions[0x03] = function () {
    let result = (this.c | (this.b << 8));
    result += 1;
    this.c = result & 0xff;
    this.b = (result & 0xff00) >>> 8;
};
Z80.prototype.instructions[0x04] = function () {
    this.b = this.do_inc(this.b);
};
Z80.prototype.instructions[0x05] = function () {
    this.b = this.do_dec(this.b);
};
Z80.prototype.instructions[0x06] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.b = this.core.mem_read(this.pc);
};
Z80.prototype.instructions[0x07] = function () {
    let temp_s = this.flags.S, temp_z = this.flags.Z, temp_p = this.flags.P;
    this.a = this.do_rlc(this.a);
    this.flags.S = temp_s;
    this.flags.Z = temp_z;
    this.flags.P = temp_p;
};
Z80.prototype.instructions[0x08] = function () {
    let temp = this.a;
    this.a = this.a_prime;
    this.a_prime = temp;
    temp = this.get_flags_register();
    this.set_flags_register(this.get_flags_prime());
    this.set_flags_prime(temp);
};
Z80.prototype.instructions[0x09] = function () {
    this.do_hl_add(this.c | (this.b << 8));
};
Z80.prototype.instructions[0x0a] = function () {
    this.a = this.core.mem_read(this.c | (this.b << 8));
};
Z80.prototype.instructions[0x0b] = function () {
    let result = (this.c | (this.b << 8));
    result -= 1;
    this.c = result & 0xff;
    this.b = (result & 0xff00) >>> 8;
};
Z80.prototype.instructions[0x0c] = function () {
    this.c = this.do_inc(this.c);
};
Z80.prototype.instructions[0x0d] = function () {
    this.c = this.do_dec(this.c);
};
Z80.prototype.instructions[0x0e] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.c = this.core.mem_read(this.pc);
};
Z80.prototype.instructions[0x0f] = function () {
    let temp_s = this.flags.S, temp_z = this.flags.Z, temp_p = this.flags.P;
    this.a = this.do_rrc(this.a);
    this.flags.S = temp_s;
    this.flags.Z = temp_z;
    this.flags.P = temp_p;
};
Z80.prototype.instructions[0x10] = function () {
    this.b = (this.b - 1) & 0xff;
    this.do_conditional_relative_jump(this.b !== 0);
};
Z80.prototype.instructions[0x11] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.e = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    this.d = this.core.mem_read(this.pc);
};
Z80.prototype.instructions[0x12] = function () {
    this.core.mem_write(this.e | (this.d << 8), this.a);
};
Z80.prototype.instructions[0x13] = function () {
    let result = (this.e | (this.d << 8));
    result += 1;
    this.e = result & 0xff;
    this.d = (result & 0xff00) >>> 8;
};
Z80.prototype.instructions[0x14] = function () {
    this.d = this.do_inc(this.d);
};
Z80.prototype.instructions[0x15] = function () {
    this.d = this.do_dec(this.d);
};
Z80.prototype.instructions[0x16] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.d = this.core.mem_read(this.pc);
};
Z80.prototype.instructions[0x17] = function () {
    let temp_s = this.flags.S, temp_z = this.flags.Z, temp_p = this.flags.P;
    this.a = this.do_rl(this.a);
    this.flags.S = temp_s;
    this.flags.Z = temp_z;
    this.flags.P = temp_p;
};
Z80.prototype.instructions[0x18] = function () {
    let offset = this.get_signed_offset_byte(this.core.mem_read((this.pc + 1) & 0xffff));
    this.pc = (this.pc + offset + 1) & 0xffff;
};
Z80.prototype.instructions[0x19] = function () {
    this.do_hl_add(this.e | (this.d << 8));
};
Z80.prototype.instructions[0x1a] = function () {
    this.a = this.core.mem_read(this.e | (this.d << 8));
};
Z80.prototype.instructions[0x1b] = function () {
    let result = (this.e | (this.d << 8));
    result -= 1;
    this.e = result & 0xff;
    this.d = (result & 0xff00) >>> 8;
};
Z80.prototype.instructions[0x1c] = function () {
    this.e = this.do_inc(this.e);
};
Z80.prototype.instructions[0x1d] = function () {
    this.e = this.do_dec(this.e);
};
Z80.prototype.instructions[0x1e] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.e = this.core.mem_read(this.pc);
};
Z80.prototype.instructions[0x1f] = function () {
    let temp_s = this.flags.S, temp_z = this.flags.Z, temp_p = this.flags.P;
    this.a = this.do_rr(this.a);
    this.flags.S = temp_s;
    this.flags.Z = temp_z;
    this.flags.P = temp_p;
};
Z80.prototype.instructions[0x20] = function () {
    this.do_conditional_relative_jump(!this.flags.Z);
};
Z80.prototype.instructions[0x21] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.l = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    this.h = this.core.mem_read(this.pc);
};
Z80.prototype.instructions[0x22] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let address = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    address |= this.core.mem_read(this.pc) << 8;
    this.core.mem_write(address, this.l);
    this.core.mem_write((address + 1) & 0xffff, this.h);
};
Z80.prototype.instructions[0x23] = function () {
    let result = (this.l | (this.h << 8));
    result += 1;
    this.l = result & 0xff;
    this.h = (result & 0xff00) >>> 8;
};
Z80.prototype.instructions[0x24] = function () {
    this.h = this.do_inc(this.h);
};
Z80.prototype.instructions[0x25] = function () {
    this.h = this.do_dec(this.h);
};
Z80.prototype.instructions[0x26] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.h = this.core.mem_read(this.pc);
};
Z80.prototype.instructions[0x27] = function () {
    let temp = this.a;
    if (!this.flags.N) {
        if (this.flags.H || ((this.a & 0x0f) > 9))
            temp += 0x06;
        if (this.flags.C || (this.a > 0x99))
            temp += 0x60;
    }
    else {
        if (this.flags.H || ((this.a & 0x0f) > 9))
            temp -= 0x06;
        if (this.flags.C || (this.a > 0x99))
            temp -= 0x60;
    }
    this.flags.S = (temp & 0x80) ? 1 : 0;
    this.flags.Z = !(temp & 0xff) ? 1 : 0;
    this.flags.H = ((this.a & 0x10) ^ (temp & 0x10)) ? 1 : 0;
    this.flags.P = this.get_parity(temp & 0xff);
    this.flags.C = (this.flags.C || (this.a > 0x99)) ? 1 : 0;
    this.a = temp & 0xff;
    this.update_xy_flags(this.a);
};
Z80.prototype.instructions[0x28] = function () {
    this.do_conditional_relative_jump(!!this.flags.Z);
};
Z80.prototype.instructions[0x29] = function () {
    this.do_hl_add(this.l | (this.h << 8));
};
Z80.prototype.instructions[0x2a] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let address = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    address |= this.core.mem_read(this.pc) << 8;
    this.l = this.core.mem_read(address);
    this.h = this.core.mem_read((address + 1) & 0xffff);
};
Z80.prototype.instructions[0x2b] = function () {
    let result = (this.l | (this.h << 8));
    result -= 1;
    this.l = result & 0xff;
    this.h = (result & 0xff00) >>> 8;
};
Z80.prototype.instructions[0x2c] = function () {
    this.l = this.do_inc(this.l);
};
Z80.prototype.instructions[0x2d] = function () {
    this.l = this.do_dec(this.l);
};
Z80.prototype.instructions[0x2e] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.l = this.core.mem_read(this.pc);
};
Z80.prototype.instructions[0x2f] = function () {
    this.a = (~this.a) & 0xff;
    this.flags.N = 1;
    this.flags.H = 1;
    this.update_xy_flags(this.a);
};
Z80.prototype.instructions[0x30] = function () {
    this.do_conditional_relative_jump(!this.flags.C);
};
Z80.prototype.instructions[0x31] = function () {
    this.sp = this.core.mem_read((this.pc + 1) & 0xffff) |
        (this.core.mem_read((this.pc + 2) & 0xffff) << 8);
    this.pc = (this.pc + 2) & 0xffff;
};
Z80.prototype.instructions[0x32] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let address = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    address |= this.core.mem_read(this.pc) << 8;
    this.core.mem_write(address, this.a);
};
Z80.prototype.instructions[0x33] = function () {
    this.sp = (this.sp + 1) & 0xffff;
};
Z80.prototype.instructions[0x34] = function () {
    let address = this.l | (this.h << 8);
    this.core.mem_write(address, this.do_inc(this.core.mem_read(address)));
};
Z80.prototype.instructions[0x35] = function () {
    let address = this.l | (this.h << 8);
    this.core.mem_write(address, this.do_dec(this.core.mem_read(address)));
};
Z80.prototype.instructions[0x36] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.core.mem_write(this.l | (this.h << 8), this.core.mem_read(this.pc));
};
Z80.prototype.instructions[0x37] = function () {
    this.flags.N = 0;
    this.flags.H = 0;
    this.flags.C = 1;
    this.update_xy_flags(this.a);
};
Z80.prototype.instructions[0x38] = function () {
    this.do_conditional_relative_jump(!!this.flags.C);
};
Z80.prototype.instructions[0x39] = function () {
    this.do_hl_add(this.sp);
};
Z80.prototype.instructions[0x3a] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let address = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    address |= this.core.mem_read(this.pc) << 8;
    this.a = this.core.mem_read(address);
};
Z80.prototype.instructions[0x3b] = function () {
    this.sp = (this.sp - 1) & 0xffff;
};
Z80.prototype.instructions[0x3c] = function () {
    this.a = this.do_inc(this.a);
};
Z80.prototype.instructions[0x3d] = function () {
    this.a = this.do_dec(this.a);
};
Z80.prototype.instructions[0x3e] = function () {
    this.a = this.core.mem_read((this.pc + 1) & 0xffff);
    this.pc = (this.pc + 1) & 0xffff;
};
Z80.prototype.instructions[0x3f] = function () {
    this.flags.N = 0;
    this.flags.H = this.flags.C;
    this.flags.C = this.flags.C ? 0 : 1;
    this.update_xy_flags(this.a);
};
Z80.prototype.instructions[0xc0] = function () {
    this.do_conditional_return(!this.flags.Z);
};
Z80.prototype.instructions[0xc1] = function () {
    let result = this.pop_word();
    this.c = result & 0xff;
    this.b = (result & 0xff00) >>> 8;
};
Z80.prototype.instructions[0xc2] = function () {
    this.do_conditional_absolute_jump(!this.flags.Z);
};
Z80.prototype.instructions[0xc3] = function () {
    this.pc = this.core.mem_read((this.pc + 1) & 0xffff) |
        (this.core.mem_read((this.pc + 2) & 0xffff) << 8);
    this.pc = (this.pc - 1) & 0xffff;
};
Z80.prototype.instructions[0xc4] = function () {
    this.do_conditional_call(!this.flags.Z);
};
Z80.prototype.instructions[0xc5] = function () {
    this.push_word(this.c | (this.b << 8));
};
Z80.prototype.instructions[0xc6] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.do_add(this.core.mem_read(this.pc));
};
Z80.prototype.instructions[0xc7] = function () {
    this.do_reset(0x00);
};
Z80.prototype.instructions[0xc8] = function () {
    this.do_conditional_return(!!this.flags.Z);
};
Z80.prototype.instructions[0xc9] = function () {
    this.pc = (this.pop_word() - 1) & 0xffff;
};
Z80.prototype.instructions[0xca] = function () {
    this.do_conditional_absolute_jump(!!this.flags.Z);
};
Z80.prototype.instructions[0xcb] = function () {
    this.r = (this.r & 0x80) | (((this.r & 0x7f) + 1) & 0x7f);
    this.pc = (this.pc + 1) & 0xffff;
    let opcode = this.core.mem_read(this.pc), bit_number = (opcode & 0x38) >>> 3, reg_code = opcode & 0x07;
    if (opcode < 0x40) {
        const op_array = [this.do_rlc, this.do_rrc, this.do_rl, this.do_rr,
            this.do_sla, this.do_sra, this.do_sll, this.do_srl];
        if (reg_code === 0)
            this.b = op_array[bit_number].call(this, this.b);
        else if (reg_code === 1)
            this.c = op_array[bit_number].call(this, this.c);
        else if (reg_code === 2)
            this.d = op_array[bit_number].call(this, this.d);
        else if (reg_code === 3)
            this.e = op_array[bit_number].call(this, this.e);
        else if (reg_code === 4)
            this.h = op_array[bit_number].call(this, this.h);
        else if (reg_code === 5)
            this.l = op_array[bit_number].call(this, this.l);
        else if (reg_code === 6)
            this.core.mem_write(this.l | (this.h << 8), op_array[bit_number].call(this, this.core.mem_read(this.l | (this.h << 8))));
        else if (reg_code === 7)
            this.a = op_array[bit_number].call(this, this.a);
    }
    else if (opcode < 0x80) {
        if (reg_code === 0)
            this.flags.Z = !(this.b & (1 << bit_number)) ? 1 : 0;
        else if (reg_code === 1)
            this.flags.Z = !(this.c & (1 << bit_number)) ? 1 : 0;
        else if (reg_code === 2)
            this.flags.Z = !(this.d & (1 << bit_number)) ? 1 : 0;
        else if (reg_code === 3)
            this.flags.Z = !(this.e & (1 << bit_number)) ? 1 : 0;
        else if (reg_code === 4)
            this.flags.Z = !(this.h & (1 << bit_number)) ? 1 : 0;
        else if (reg_code === 5)
            this.flags.Z = !(this.l & (1 << bit_number)) ? 1 : 0;
        else if (reg_code === 6)
            this.flags.Z = !((this.core.mem_read(this.l | (this.h << 8))) & (1 << bit_number)) ? 1 : 0;
        else if (reg_code === 7)
            this.flags.Z = !(this.a & (1 << bit_number)) ? 1 : 0;
        this.flags.N = 0;
        this.flags.H = 1;
        this.flags.P = this.flags.Z;
        this.flags.S = ((bit_number === 7) && !this.flags.Z) ? 1 : 0;
        this.flags.Y = ((bit_number === 5) && !this.flags.Z) ? 1 : 0;
        this.flags.X = ((bit_number === 3) && !this.flags.Z) ? 1 : 0;
    }
    else if (opcode < 0xc0) {
        if (reg_code === 0)
            this.b &= (0xff & ~(1 << bit_number));
        else if (reg_code === 1)
            this.c &= (0xff & ~(1 << bit_number));
        else if (reg_code === 2)
            this.d &= (0xff & ~(1 << bit_number));
        else if (reg_code === 3)
            this.e &= (0xff & ~(1 << bit_number));
        else if (reg_code === 4)
            this.h &= (0xff & ~(1 << bit_number));
        else if (reg_code === 5)
            this.l &= (0xff & ~(1 << bit_number));
        else if (reg_code === 6)
            this.core.mem_write(this.l | (this.h << 8), this.core.mem_read(this.l | (this.h << 8)) & ~(1 << bit_number));
        else if (reg_code === 7)
            this.a &= (0xff & ~(1 << bit_number));
    }
    else {
        if (reg_code === 0)
            this.b |= (1 << bit_number);
        else if (reg_code === 1)
            this.c |= (1 << bit_number);
        else if (reg_code === 2)
            this.d |= (1 << bit_number);
        else if (reg_code === 3)
            this.e |= (1 << bit_number);
        else if (reg_code === 4)
            this.h |= (1 << bit_number);
        else if (reg_code === 5)
            this.l |= (1 << bit_number);
        else if (reg_code === 6)
            this.core.mem_write(this.l | (this.h << 8), this.core.mem_read(this.l | (this.h << 8)) | (1 << bit_number));
        else if (reg_code === 7)
            this.a |= (1 << bit_number);
    }
    this.cycle_counter += this.cycle_counts_cb[opcode];
};
Z80.prototype.instructions[0xcc] = function () {
    this.do_conditional_call(!!this.flags.Z);
};
Z80.prototype.instructions[0xcd] = function () {
    this.push_word((this.pc + 3) & 0xffff);
    this.pc = this.core.mem_read((this.pc + 1) & 0xffff) |
        (this.core.mem_read((this.pc + 2) & 0xffff) << 8);
    this.pc = (this.pc - 1) & 0xffff;
};
Z80.prototype.instructions[0xce] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.do_adc(this.core.mem_read(this.pc));
};
Z80.prototype.instructions[0xcf] = function () {
    this.do_reset(0x08);
};
Z80.prototype.instructions[0xd0] = function () {
    this.do_conditional_return(!this.flags.C);
};
Z80.prototype.instructions[0xd1] = function () {
    let result = this.pop_word();
    this.e = result & 0xff;
    this.d = (result & 0xff00) >>> 8;
};
Z80.prototype.instructions[0xd2] = function () {
    this.do_conditional_absolute_jump(!this.flags.C);
};
Z80.prototype.instructions[0xd3] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.core.io_write((this.a << 8) | this.core.mem_read(this.pc), this.a);
};
Z80.prototype.instructions[0xd4] = function () {
    this.do_conditional_call(!this.flags.C);
};
Z80.prototype.instructions[0xd5] = function () {
    this.push_word(this.e | (this.d << 8));
};
Z80.prototype.instructions[0xd6] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.do_sub(this.core.mem_read(this.pc));
};
Z80.prototype.instructions[0xd7] = function () {
    this.do_reset(0x10);
};
Z80.prototype.instructions[0xd8] = function () {
    this.do_conditional_return(!!this.flags.C);
};
Z80.prototype.instructions[0xd9] = function () {
    let temp = this.b;
    this.b = this.b_prime;
    this.b_prime = temp;
    temp = this.c;
    this.c = this.c_prime;
    this.c_prime = temp;
    temp = this.d;
    this.d = this.d_prime;
    this.d_prime = temp;
    temp = this.e;
    this.e = this.e_prime;
    this.e_prime = temp;
    temp = this.h;
    this.h = this.h_prime;
    this.h_prime = temp;
    temp = this.l;
    this.l = this.l_prime;
    this.l_prime = temp;
};
Z80.prototype.instructions[0xda] = function () {
    this.do_conditional_absolute_jump(!!this.flags.C);
};
Z80.prototype.instructions[0xdb] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.a = this.core.io_read((this.a << 8) | this.core.mem_read(this.pc));
};
Z80.prototype.instructions[0xdc] = function () {
    this.do_conditional_call(!!this.flags.C);
};
Z80.prototype.instructions[0xdd] = function () {
    this.r = (this.r & 0x80) | (((this.r & 0x7f) + 1) & 0x7f);
    this.pc = (this.pc + 1) & 0xffff;
    let opcode = this.core.mem_read(this.pc), func = this.dd_instructions[opcode];
    if (func) {
        func = func.bind(this);
        func();
        this.cycle_counter += this.cycle_counts_dd[opcode];
    }
    else {
        this.pc = (this.pc - 1) & 0xffff;
        this.cycle_counter += this.cycle_counts[0];
    }
};
Z80.prototype.instructions[0xde] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.do_sbc(this.core.mem_read(this.pc));
};
Z80.prototype.instructions[0xdf] = function () {
    this.do_reset(0x18);
};
Z80.prototype.instructions[0xe0] = function () {
    this.do_conditional_return(!this.flags.P);
};
Z80.prototype.instructions[0xe1] = function () {
    let result = this.pop_word();
    this.l = result & 0xff;
    this.h = (result & 0xff00) >>> 8;
};
Z80.prototype.instructions[0xe2] = function () {
    this.do_conditional_absolute_jump(!this.flags.P);
};
Z80.prototype.instructions[0xe3] = function () {
    let temp = this.core.mem_read(this.sp);
    this.core.mem_write(this.sp, this.l);
    this.l = temp;
    temp = this.core.mem_read((this.sp + 1) & 0xffff);
    this.core.mem_write((this.sp + 1) & 0xffff, this.h);
    this.h = temp;
};
Z80.prototype.instructions[0xe4] = function () {
    this.do_conditional_call(!this.flags.P);
};
Z80.prototype.instructions[0xe5] = function () {
    this.push_word(this.l | (this.h << 8));
};
Z80.prototype.instructions[0xe6] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.do_and(this.core.mem_read(this.pc));
};
Z80.prototype.instructions[0xe7] = function () {
    this.do_reset(0x20);
};
Z80.prototype.instructions[0xe8] = function () {
    this.do_conditional_return(!!this.flags.P);
};
Z80.prototype.instructions[0xe9] = function () {
    this.pc = this.l | (this.h << 8);
    this.pc = (this.pc - 1) & 0xffff;
};
Z80.prototype.instructions[0xea] = function () {
    this.do_conditional_absolute_jump(!!this.flags.P);
};
Z80.prototype.instructions[0xeb] = function () {
    let temp = this.d;
    this.d = this.h;
    this.h = temp;
    temp = this.e;
    this.e = this.l;
    this.l = temp;
};
Z80.prototype.instructions[0xec] = function () {
    this.do_conditional_call(!!this.flags.P);
};
Z80.prototype.instructions[0xed] = function () {
    this.r = (this.r & 0x80) | (((this.r & 0x7f) + 1) & 0x7f);
    this.pc = (this.pc + 1) & 0xffff;
    let opcode = this.core.mem_read(this.pc), func = this.ed_instructions[opcode];
    if (func) {
        func = func.bind(this);
        func();
        this.cycle_counter += this.cycle_counts_ed[opcode];
    }
    else {
        this.cycle_counter += this.cycle_counts[0];
    }
};
Z80.prototype.instructions[0xee] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.do_xor(this.core.mem_read(this.pc));
};
Z80.prototype.instructions[0xef] = function () {
    this.do_reset(0x28);
};
Z80.prototype.instructions[0xf0] = function () {
    this.do_conditional_return(!this.flags.S);
};
Z80.prototype.instructions[0xf1] = function () {
    let result = this.pop_word();
    this.set_flags_register(result & 0xff);
    this.a = (result & 0xff00) >>> 8;
};
Z80.prototype.instructions[0xf2] = function () {
    this.do_conditional_absolute_jump(!this.flags.S);
};
Z80.prototype.instructions[0xf3] = function () {
    this.do_delayed_di = true;
};
Z80.prototype.instructions[0xf4] = function () {
    this.do_conditional_call(!this.flags.S);
};
Z80.prototype.instructions[0xf5] = function () {
    this.push_word(this.get_flags_register() | (this.a << 8));
};
Z80.prototype.instructions[0xf6] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.do_or(this.core.mem_read(this.pc));
};
Z80.prototype.instructions[0xf7] = function () {
    this.do_reset(0x30);
};
Z80.prototype.instructions[0xf8] = function () {
    this.do_conditional_return(!!this.flags.S);
};
Z80.prototype.instructions[0xf9] = function () {
    this.sp = this.l | (this.h << 8);
};
Z80.prototype.instructions[0xfa] = function () {
    this.do_conditional_absolute_jump(!!this.flags.S);
};
Z80.prototype.instructions[0xfb] = function () {
    this.do_delayed_ei = true;
};
Z80.prototype.instructions[0xfc] = function () {
    this.do_conditional_call(!!this.flags.S);
};
Z80.prototype.instructions[0xfd] = function () {
    this.r = (this.r & 0x80) | (((this.r & 0x7f) + 1) & 0x7f);
    this.pc = (this.pc + 1) & 0xffff;
    let opcode = this.core.mem_read(this.pc), func = this.dd_instructions[opcode];
    if (func) {
        let temp = this.ix;
        this.ix = this.iy;
        func = func.bind(this);
        func();
        this.iy = this.ix;
        this.ix = temp;
        this.cycle_counter += this.cycle_counts_dd[opcode];
    }
    else {
        this.pc = (this.pc - 1) & 0xffff;
        this.cycle_counter += this.cycle_counts[0];
    }
};
Z80.prototype.instructions[0xfe] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.do_cp(this.core.mem_read(this.pc));
};
Z80.prototype.instructions[0xff] = function () {
    this.do_reset(0x38);
};
Z80.prototype.ed_instructions = [];
Z80.prototype.ed_instructions[0x40] = function () {
    this.b = this.do_in((this.b << 8) | this.c);
};
Z80.prototype.ed_instructions[0x41] = function () {
    this.core.io_write((this.b << 8) | this.c, this.b);
};
Z80.prototype.ed_instructions[0x42] = function () {
    this.do_hl_sbc(this.c | (this.b << 8));
};
Z80.prototype.ed_instructions[0x43] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let address = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    address |= this.core.mem_read(this.pc) << 8;
    this.core.mem_write(address, this.c);
    this.core.mem_write((address + 1) & 0xffff, this.b);
};
Z80.prototype.ed_instructions[0x44] = function () {
    this.do_neg();
};
Z80.prototype.ed_instructions[0x45] = function () {
    this.pc = (this.pop_word() - 1) & 0xffff;
    this.iff1 = this.iff2;
};
Z80.prototype.ed_instructions[0x46] = function () {
    this.imode = 0;
};
Z80.prototype.ed_instructions[0x47] = function () {
    this.i = this.a;
};
Z80.prototype.ed_instructions[0x48] = function () {
    this.c = this.do_in((this.b << 8) | this.c);
};
Z80.prototype.ed_instructions[0x49] = function () {
    this.core.io_write((this.b << 8) | this.c, this.c);
};
Z80.prototype.ed_instructions[0x4a] = function () {
    this.do_hl_adc(this.c | (this.b << 8));
};
Z80.prototype.ed_instructions[0x4b] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let address = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    address |= this.core.mem_read(this.pc) << 8;
    this.c = this.core.mem_read(address);
    this.b = this.core.mem_read((address + 1) & 0xffff);
};
Z80.prototype.ed_instructions[0x4c] = function () {
    this.do_neg();
};
Z80.prototype.ed_instructions[0x4d] = function () {
    this.pc = (this.pop_word() - 1) & 0xffff;
};
Z80.prototype.ed_instructions[0x4e] = function () {
    this.imode = 0;
};
Z80.prototype.ed_instructions[0x4f] = function () {
    this.r = this.a;
};
Z80.prototype.ed_instructions[0x50] = function () {
    this.d = this.do_in((this.b << 8) | this.c);
};
Z80.prototype.ed_instructions[0x51] = function () {
    this.core.io_write((this.b << 8) | this.c, this.d);
};
Z80.prototype.ed_instructions[0x52] = function () {
    this.do_hl_sbc(this.e | (this.d << 8));
};
Z80.prototype.ed_instructions[0x53] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let address = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    address |= this.core.mem_read(this.pc) << 8;
    this.core.mem_write(address, this.e);
    this.core.mem_write((address + 1) & 0xffff, this.d);
};
Z80.prototype.ed_instructions[0x54] = function () {
    this.do_neg();
};
Z80.prototype.ed_instructions[0x55] = function () {
    this.pc = (this.pop_word() - 1) & 0xffff;
    this.iff1 = this.iff2;
};
Z80.prototype.ed_instructions[0x56] = function () {
    this.imode = 1;
};
Z80.prototype.ed_instructions[0x57] = function () {
    this.a = this.i;
    this.flags.P = this.iff2;
    this.flags.S = (this.a & 0x80) !== 0;
    this.flags.X = (this.a & 0x08) !== 0;
    this.flags.Y = (this.a & 0x20) !== 0;
    this.flags.Z = this.a === 0;
    this.flags.H = 0;
    this.flags.N = 0;
};
Z80.prototype.ed_instructions[0x58] = function () {
    this.e = this.do_in((this.b << 8) | this.c);
};
Z80.prototype.ed_instructions[0x59] = function () {
    this.core.io_write((this.b << 8) | this.c, this.e);
};
Z80.prototype.ed_instructions[0x5a] = function () {
    this.do_hl_adc(this.e | (this.d << 8));
};
Z80.prototype.ed_instructions[0x5b] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let address = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    address |= this.core.mem_read(this.pc) << 8;
    this.e = this.core.mem_read(address);
    this.d = this.core.mem_read((address + 1) & 0xffff);
};
Z80.prototype.ed_instructions[0x5c] = function () {
    this.do_neg();
};
Z80.prototype.ed_instructions[0x5d] = function () {
    this.pc = (this.pop_word() - 1) & 0xffff;
    this.iff1 = this.iff2;
};
Z80.prototype.ed_instructions[0x5e] = function () {
    this.imode = 2;
};
Z80.prototype.ed_instructions[0x5f] = function () {
    this.a = this.r;
    this.flags.P = this.iff2;
    this.flags.S = (this.a & 0x80) !== 0;
    this.flags.X = (this.a & 0x08) !== 0;
    this.flags.Y = (this.a & 0x20) !== 0;
    this.flags.Z = this.a === 0;
    this.flags.H = 0;
    this.flags.N = 0;
};
Z80.prototype.ed_instructions[0x60] = function () {
    this.h = this.do_in((this.b << 8) | this.c);
};
Z80.prototype.ed_instructions[0x61] = function () {
    this.core.io_write((this.b << 8) | this.c, this.h);
};
Z80.prototype.ed_instructions[0x62] = function () {
    this.do_hl_sbc(this.l | (this.h << 8));
};
Z80.prototype.ed_instructions[0x63] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let address = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    address |= this.core.mem_read(this.pc) << 8;
    this.core.mem_write(address, this.l);
    this.core.mem_write((address + 1) & 0xffff, this.h);
};
Z80.prototype.ed_instructions[0x64] = function () {
    this.do_neg();
};
Z80.prototype.ed_instructions[0x65] = function () {
    this.pc = (this.pop_word() - 1) & 0xffff;
    this.iff1 = this.iff2;
};
Z80.prototype.ed_instructions[0x66] = function () {
    this.imode = 0;
};
Z80.prototype.ed_instructions[0x67] = function () {
    let hl_value = this.core.mem_read(this.l | (this.h << 8));
    let temp1 = hl_value & 0x0f, temp2 = this.a & 0x0f;
    hl_value = ((hl_value & 0xf0) >>> 4) | (temp2 << 4);
    this.a = (this.a & 0xf0) | temp1;
    this.core.mem_write(this.l | (this.h << 8), hl_value);
    this.flags.S = (this.a & 0x80) ? 1 : 0;
    this.flags.Z = this.a ? 0 : 1;
    this.flags.H = 0;
    this.flags.P = this.get_parity(this.a) ? 1 : 0;
    this.flags.N = 0;
    this.update_xy_flags(this.a);
};
Z80.prototype.ed_instructions[0x68] = function () {
    this.l = this.do_in((this.b << 8) | this.c);
};
Z80.prototype.ed_instructions[0x69] = function () {
    this.core.io_write((this.b << 8) | this.c, this.l);
};
Z80.prototype.ed_instructions[0x6a] = function () {
    this.do_hl_adc(this.l | (this.h << 8));
};
Z80.prototype.ed_instructions[0x6b] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let address = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    address |= this.core.mem_read(this.pc) << 8;
    this.l = this.core.mem_read(address);
    this.h = this.core.mem_read((address + 1) & 0xffff);
};
Z80.prototype.ed_instructions[0x6c] = function () {
    this.do_neg();
};
Z80.prototype.ed_instructions[0x6d] = function () {
    this.pc = (this.pop_word() - 1) & 0xffff;
    this.iff1 = this.iff2;
};
Z80.prototype.ed_instructions[0x6e] = function () {
    this.imode = 0;
};
Z80.prototype.ed_instructions[0x6f] = function () {
    let hl_value = this.core.mem_read(this.l | (this.h << 8));
    let temp1 = hl_value & 0xf0, temp2 = this.a & 0x0f;
    hl_value = ((hl_value & 0x0f) << 4) | temp2;
    this.a = (this.a & 0xf0) | (temp1 >>> 4);
    this.core.mem_write(this.l | (this.h << 8), hl_value);
    this.flags.S = (this.a & 0x80) ? 1 : 0;
    this.flags.Z = this.a ? 0 : 1;
    this.flags.H = 0;
    this.flags.P = this.get_parity(this.a) ? 1 : 0;
    this.flags.N = 0;
    this.update_xy_flags(this.a);
};
Z80.prototype.ed_instructions[0x70] = function () {
    this.do_in((this.b << 8) | this.c);
};
Z80.prototype.ed_instructions[0x71] = function () {
    this.core.io_write((this.b << 8) | this.c, 0);
};
Z80.prototype.ed_instructions[0x72] = function () {
    this.do_hl_sbc(this.sp);
};
Z80.prototype.ed_instructions[0x73] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let address = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    address |= this.core.mem_read(this.pc) << 8;
    this.core.mem_write(address, this.sp & 0xff);
    this.core.mem_write((address + 1) & 0xffff, (this.sp >>> 8) & 0xff);
};
Z80.prototype.ed_instructions[0x74] = function () {
    this.do_neg();
};
Z80.prototype.ed_instructions[0x75] = function () {
    this.pc = (this.pop_word() - 1) & 0xffff;
    this.iff1 = this.iff2;
};
Z80.prototype.ed_instructions[0x76] = function () {
    this.imode = 1;
};
Z80.prototype.ed_instructions[0x78] = function () {
    this.a = this.do_in((this.b << 8) | this.c);
};
Z80.prototype.ed_instructions[0x79] = function () {
    this.core.io_write((this.b << 8) | this.c, this.a);
};
Z80.prototype.ed_instructions[0x7a] = function () {
    this.do_hl_adc(this.sp);
};
Z80.prototype.ed_instructions[0x7b] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let address = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    address |= this.core.mem_read(this.pc) << 8;
    this.sp = this.core.mem_read(address);
    this.sp |= this.core.mem_read((address + 1) & 0xffff) << 8;
};
Z80.prototype.ed_instructions[0x7c] = function () {
    this.do_neg();
};
Z80.prototype.ed_instructions[0x7d] = function () {
    this.pc = (this.pop_word() - 1) & 0xffff;
    this.iff1 = this.iff2;
};
Z80.prototype.ed_instructions[0x7e] = function () {
    this.imode = 2;
};
Z80.prototype.ed_instructions[0xa0] = function () {
    this.do_ldi();
};
Z80.prototype.ed_instructions[0xa1] = function () {
    this.do_cpi();
};
Z80.prototype.ed_instructions[0xa2] = function () {
    this.do_ini();
};
Z80.prototype.ed_instructions[0xa3] = function () {
    this.do_outi();
};
Z80.prototype.ed_instructions[0xa8] = function () {
    this.do_ldd();
};
Z80.prototype.ed_instructions[0xa9] = function () {
    this.do_cpd();
};
Z80.prototype.ed_instructions[0xaa] = function () {
    this.do_ind();
};
Z80.prototype.ed_instructions[0xab] = function () {
    this.do_outd();
};
Z80.prototype.ed_instructions[0xb0] = function () {
    this.do_ldi();
    if (this.b || this.c) {
        this.cycle_counter += 5;
        this.pc = (this.pc - 2) & 0xffff;
    }
};
Z80.prototype.ed_instructions[0xb1] = function () {
    this.do_cpi();
    if (!this.flags.Z && (this.b || this.c)) {
        this.cycle_counter += 5;
        this.pc = (this.pc - 2) & 0xffff;
    }
};
Z80.prototype.ed_instructions[0xb2] = function () {
    this.do_ini();
    if (this.b) {
        this.cycle_counter += 5;
        this.pc = (this.pc - 2) & 0xffff;
    }
};
Z80.prototype.ed_instructions[0xb3] = function () {
    this.do_outi();
    if (this.b) {
        this.cycle_counter += 5;
        this.pc = (this.pc - 2) & 0xffff;
    }
};
Z80.prototype.ed_instructions[0xb8] = function () {
    this.do_ldd();
    if (this.b || this.c) {
        this.cycle_counter += 5;
        this.pc = (this.pc - 2) & 0xffff;
    }
};
Z80.prototype.ed_instructions[0xb9] = function () {
    this.do_cpd();
    if (!this.flags.Z && (this.b || this.c)) {
        this.cycle_counter += 5;
        this.pc = (this.pc - 2) & 0xffff;
    }
};
Z80.prototype.ed_instructions[0xba] = function () {
    this.do_ind();
    if (this.b) {
        this.cycle_counter += 5;
        this.pc = (this.pc - 2) & 0xffff;
    }
};
Z80.prototype.ed_instructions[0xbb] = function () {
    this.do_outd();
    if (this.b) {
        this.cycle_counter += 5;
        this.pc = (this.pc - 2) & 0xffff;
    }
};
Z80.prototype.dd_instructions = [];
Z80.prototype.dd_instructions[0x09] = function () {
    this.do_ix_add(this.c | (this.b << 8));
};
Z80.prototype.dd_instructions[0x19] = function () {
    this.do_ix_add(this.e | (this.d << 8));
};
Z80.prototype.dd_instructions[0x21] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.ix = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    this.ix |= (this.core.mem_read(this.pc) << 8);
};
Z80.prototype.dd_instructions[0x22] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let address = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    address |= (this.core.mem_read(this.pc) << 8);
    this.core.mem_write(address, this.ix & 0xff);
    this.core.mem_write((address + 1) & 0xffff, (this.ix >>> 8) & 0xff);
};
Z80.prototype.dd_instructions[0x23] = function () {
    this.ix = (this.ix + 1) & 0xffff;
};
Z80.prototype.dd_instructions[0x24] = function () {
    this.ix = (this.do_inc(this.ix >>> 8) << 8) | (this.ix & 0xff);
};
Z80.prototype.dd_instructions[0x25] = function () {
    this.ix = (this.do_dec(this.ix >>> 8) << 8) | (this.ix & 0xff);
};
Z80.prototype.dd_instructions[0x26] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.ix = (this.core.mem_read(this.pc) << 8) | (this.ix & 0xff);
};
Z80.prototype.dd_instructions[0x29] = function () {
    this.do_ix_add(this.ix);
};
Z80.prototype.dd_instructions[0x2a] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let address = this.core.mem_read(this.pc);
    this.pc = (this.pc + 1) & 0xffff;
    address |= (this.core.mem_read(this.pc) << 8);
    this.ix = this.core.mem_read(address);
    this.ix |= (this.core.mem_read((address + 1) & 0xffff) << 8);
};
Z80.prototype.dd_instructions[0x2b] = function () {
    this.ix = (this.ix - 1) & 0xffff;
};
Z80.prototype.dd_instructions[0x2c] = function () {
    this.ix = this.do_inc(this.ix & 0xff) | (this.ix & 0xff00);
};
Z80.prototype.dd_instructions[0x2d] = function () {
    this.ix = this.do_dec(this.ix & 0xff) | (this.ix & 0xff00);
};
Z80.prototype.dd_instructions[0x2e] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    this.ix = (this.core.mem_read(this.pc) & 0xff) | (this.ix & 0xff00);
};
Z80.prototype.dd_instructions[0x34] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc)), value = this.core.mem_read((offset + this.ix) & 0xffff);
    this.core.mem_write((offset + this.ix) & 0xffff, this.do_inc(value));
};
Z80.prototype.dd_instructions[0x35] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc)), value = this.core.mem_read((offset + this.ix) & 0xffff);
    this.core.mem_write((offset + this.ix) & 0xffff, this.do_dec(value));
};
Z80.prototype.dd_instructions[0x36] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.pc = (this.pc + 1) & 0xffff;
    this.core.mem_write((this.ix + offset) & 0xffff, this.core.mem_read(this.pc));
};
Z80.prototype.dd_instructions[0x39] = function () {
    this.do_ix_add(this.sp);
};
Z80.prototype.dd_instructions[0x44] = function () {
    this.b = (this.ix >>> 8) & 0xff;
};
Z80.prototype.dd_instructions[0x45] = function () {
    this.b = this.ix & 0xff;
};
Z80.prototype.dd_instructions[0x46] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.b = this.core.mem_read((this.ix + offset) & 0xffff);
};
Z80.prototype.dd_instructions[0x4c] = function () {
    this.c = (this.ix >>> 8) & 0xff;
};
Z80.prototype.dd_instructions[0x4d] = function () {
    this.c = this.ix & 0xff;
};
Z80.prototype.dd_instructions[0x4e] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.c = this.core.mem_read((this.ix + offset) & 0xffff);
};
Z80.prototype.dd_instructions[0x54] = function () {
    this.d = (this.ix >>> 8) & 0xff;
};
Z80.prototype.dd_instructions[0x55] = function () {
    this.d = this.ix & 0xff;
};
Z80.prototype.dd_instructions[0x56] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.d = this.core.mem_read((this.ix + offset) & 0xffff);
};
Z80.prototype.dd_instructions[0x5c] = function () {
    this.e = (this.ix >>> 8) & 0xff;
};
Z80.prototype.dd_instructions[0x5d] = function () {
    this.e = this.ix & 0xff;
};
Z80.prototype.dd_instructions[0x5e] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.e = this.core.mem_read((this.ix + offset) & 0xffff);
};
Z80.prototype.dd_instructions[0x60] = function () {
    this.ix = (this.ix & 0xff) | (this.b << 8);
};
Z80.prototype.dd_instructions[0x61] = function () {
    this.ix = (this.ix & 0xff) | (this.c << 8);
};
Z80.prototype.dd_instructions[0x62] = function () {
    this.ix = (this.ix & 0xff) | (this.d << 8);
};
Z80.prototype.dd_instructions[0x63] = function () {
    this.ix = (this.ix & 0xff) | (this.e << 8);
};
Z80.prototype.dd_instructions[0x64] = function () {
};
Z80.prototype.dd_instructions[0x65] = function () {
    this.ix = (this.ix & 0xff) | ((this.ix & 0xff) << 8);
};
Z80.prototype.dd_instructions[0x66] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.h = this.core.mem_read((this.ix + offset) & 0xffff);
};
Z80.prototype.dd_instructions[0x67] = function () {
    this.ix = (this.ix & 0xff) | (this.a << 8);
};
Z80.prototype.dd_instructions[0x68] = function () {
    this.ix = (this.ix & 0xff00) | this.b;
};
Z80.prototype.dd_instructions[0x69] = function () {
    this.ix = (this.ix & 0xff00) | this.c;
};
Z80.prototype.dd_instructions[0x6a] = function () {
    this.ix = (this.ix & 0xff00) | this.d;
};
Z80.prototype.dd_instructions[0x6b] = function () {
    this.ix = (this.ix & 0xff00) | this.e;
};
Z80.prototype.dd_instructions[0x6c] = function () {
    this.ix = (this.ix & 0xff00) | (this.ix >>> 8);
};
Z80.prototype.dd_instructions[0x6d] = function () {
};
Z80.prototype.dd_instructions[0x6e] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.l = this.core.mem_read((this.ix + offset) & 0xffff);
};
Z80.prototype.dd_instructions[0x6f] = function () {
    this.ix = (this.ix & 0xff00) | this.a;
};
Z80.prototype.dd_instructions[0x70] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.core.mem_write((this.ix + offset) & 0xffff, this.b);
};
Z80.prototype.dd_instructions[0x71] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.core.mem_write((this.ix + offset) & 0xffff, this.c);
};
Z80.prototype.dd_instructions[0x72] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.core.mem_write((this.ix + offset) & 0xffff, this.d);
};
Z80.prototype.dd_instructions[0x73] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.core.mem_write((this.ix + offset) & 0xffff, this.e);
};
Z80.prototype.dd_instructions[0x74] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.core.mem_write((this.ix + offset) & 0xffff, this.h);
};
Z80.prototype.dd_instructions[0x75] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.core.mem_write((this.ix + offset) & 0xffff, this.l);
};
Z80.prototype.dd_instructions[0x77] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.core.mem_write((this.ix + offset) & 0xffff, this.a);
};
Z80.prototype.dd_instructions[0x7c] = function () {
    this.a = (this.ix >>> 8) & 0xff;
};
Z80.prototype.dd_instructions[0x7d] = function () {
    this.a = this.ix & 0xff;
};
Z80.prototype.dd_instructions[0x7e] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.a = this.core.mem_read((this.ix + offset) & 0xffff);
};
Z80.prototype.dd_instructions[0x84] = function () {
    this.do_add((this.ix >>> 8) & 0xff);
};
Z80.prototype.dd_instructions[0x85] = function () {
    this.do_add(this.ix & 0xff);
};
Z80.prototype.dd_instructions[0x86] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.do_add(this.core.mem_read((this.ix + offset) & 0xffff));
};
Z80.prototype.dd_instructions[0x8c] = function () {
    this.do_adc((this.ix >>> 8) & 0xff);
};
Z80.prototype.dd_instructions[0x8d] = function () {
    this.do_adc(this.ix & 0xff);
};
Z80.prototype.dd_instructions[0x8e] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.do_adc(this.core.mem_read((this.ix + offset) & 0xffff));
};
Z80.prototype.dd_instructions[0x94] = function () {
    this.do_sub((this.ix >>> 8) & 0xff);
};
Z80.prototype.dd_instructions[0x95] = function () {
    this.do_sub(this.ix & 0xff);
};
Z80.prototype.dd_instructions[0x96] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.do_sub(this.core.mem_read((this.ix + offset) & 0xffff));
};
Z80.prototype.dd_instructions[0x9c] = function () {
    this.do_sbc((this.ix >>> 8) & 0xff);
};
Z80.prototype.dd_instructions[0x9d] = function () {
    this.do_sbc(this.ix & 0xff);
};
Z80.prototype.dd_instructions[0x9e] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.do_sbc(this.core.mem_read((this.ix + offset) & 0xffff));
};
Z80.prototype.dd_instructions[0xa4] = function () {
    this.do_and((this.ix >>> 8) & 0xff);
};
Z80.prototype.dd_instructions[0xa5] = function () {
    this.do_and(this.ix & 0xff);
};
Z80.prototype.dd_instructions[0xa6] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.do_and(this.core.mem_read((this.ix + offset) & 0xffff));
};
Z80.prototype.dd_instructions[0xac] = function () {
    this.do_xor((this.ix >>> 8) & 0xff);
};
Z80.prototype.dd_instructions[0xad] = function () {
    this.do_xor(this.ix & 0xff);
};
Z80.prototype.dd_instructions[0xae] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.do_xor(this.core.mem_read((this.ix + offset) & 0xffff));
};
Z80.prototype.dd_instructions[0xb4] = function () {
    this.do_or((this.ix >>> 8) & 0xff);
};
Z80.prototype.dd_instructions[0xb5] = function () {
    this.do_or(this.ix & 0xff);
};
Z80.prototype.dd_instructions[0xb6] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.do_or(this.core.mem_read((this.ix + offset) & 0xffff));
};
Z80.prototype.dd_instructions[0xbc] = function () {
    this.do_cp((this.ix >>> 8) & 0xff);
};
Z80.prototype.dd_instructions[0xbd] = function () {
    this.do_cp(this.ix & 0xff);
};
Z80.prototype.dd_instructions[0xbe] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.do_cp(this.core.mem_read((this.ix + offset) & 0xffff));
};
Z80.prototype.dd_instructions[0xcb] = function () {
    this.pc = (this.pc + 1) & 0xffff;
    let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
    this.pc = (this.pc + 1) & 0xffff;
    let opcode = this.core.mem_read(this.pc), value;
    if (opcode < 0x40) {
        const ddcb_functions = [this.do_rlc, this.do_rrc, this.do_rl, this.do_rr,
            this.do_sla, this.do_sra, this.do_sll, this.do_srl];
        let func = ddcb_functions[(opcode & 0x38) >>> 3], value = func.call(this, this.core.mem_read((this.ix + offset) & 0xffff));
        this.core.mem_write((this.ix + offset) & 0xffff, value);
    }
    else {
        let bit_number = (opcode & 0x38) >>> 3;
        if (opcode < 0x80) {
            this.flags.N = 0;
            this.flags.H = 1;
            this.flags.Z = !(this.core.mem_read((this.ix + offset) & 0xffff) & (1 << bit_number)) ? 1 : 0;
            this.flags.P = this.flags.Z;
            this.flags.S = ((bit_number === 7) && !this.flags.Z) ? 1 : 0;
        }
        else if (opcode < 0xc0) {
            value = this.core.mem_read((this.ix + offset) & 0xffff) & ~(1 << bit_number) & 0xff;
            this.core.mem_write((this.ix + offset) & 0xffff, value);
        }
        else {
            value = this.core.mem_read((this.ix + offset) & 0xffff) | (1 << bit_number);
            this.core.mem_write((this.ix + offset) & 0xffff, value);
        }
    }
    if (value !== undefined) {
        if ((opcode & 0x07) === 0)
            this.b = value;
        else if ((opcode & 0x07) === 1)
            this.c = value;
        else if ((opcode & 0x07) === 2)
            this.d = value;
        else if ((opcode & 0x07) === 3)
            this.e = value;
        else if ((opcode & 0x07) === 4)
            this.h = value;
        else if ((opcode & 0x07) === 5)
            this.l = value;
        else if ((opcode & 0x07) === 7)
            this.a = value;
    }
    this.cycle_counter += this.cycle_counts_cb[opcode] + 8;
};
Z80.prototype.dd_instructions[0xe1] = function () {
    this.ix = this.pop_word();
};
Z80.prototype.dd_instructions[0xe3] = function () {
    let temp = this.ix;
    this.ix = this.core.mem_read(this.sp);
    this.ix |= this.core.mem_read((this.sp + 1) & 0xffff) << 8;
    this.core.mem_write(this.sp, temp & 0xff);
    this.core.mem_write((this.sp + 1) & 0xffff, (temp >>> 8) & 0xff);
};
Z80.prototype.dd_instructions[0xe5] = function () {
    this.push_word(this.ix);
};
Z80.prototype.dd_instructions[0xe9] = function () {
    this.pc = (this.ix - 1) & 0xffff;
};
Z80.prototype.dd_instructions[0xf9] = function () {
    this.sp = this.ix;
};
Z80.prototype.cycle_counts = [
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
Z80.prototype.cycle_counts_ed = [
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
Z80.prototype.cycle_counts_cb = [
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
Z80.prototype.cycle_counts_dd = [
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
export class ExidyZ80 {
    constructor(memory, input, output) {
        this.cpu = new Z80({
            mem_read: (address) => { return memory.readByte(address); },
            mem_write: (address, data) => { memory.writeByte(address, data); },
            io_read: (address) => { return input.readByte(address); },
            io_write: (address, data) => { output.writeByte(address, data); }
        }).api;
    }
    reset(address) {
        this.cpu.reset(address);
    }
    executeInstruction() {
        return this.cpu.run_instruction();
    }
    interrupt(non_maskable, value) {
        this.cpu.interrupt(non_maskable, value);
    }
    load(data) {
        this.cpu.load({
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
            pc: data[26] | (data[27] << 8)
        });
    }
}
