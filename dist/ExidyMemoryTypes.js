'use strict';
import MemoryType from './ExidyMemoryType';
export default class ExidyMemoryTypes {
}
ExidyMemoryTypes.UserCharacterRam = new MemoryType(9, 'User defined character RAM', 0xFC00, 0xFFFF);
ExidyMemoryTypes.AsciiCharacterRom = new MemoryType(8, 'ASCII character ROM', 0xF800, 0xFBFF);
ExidyMemoryTypes.ScreenRam = new MemoryType(7, 'Screen RAM', 0xF080, 0xF7FF);
ExidyMemoryTypes.VideoScratchRam = new MemoryType(6, 'Video scratch RAM', 0xF000, 0xF07F);
ExidyMemoryTypes.MonitorRom = new MemoryType(5, 'Monitor ROM', 0xE000, 0xEFFF);
ExidyMemoryTypes.RomPack8K = new MemoryType(4, '8K ROM Pack', 0xC000, 0xDFFF);
ExidyMemoryTypes.DiskSystemInterface = new MemoryType(3, 'Disk system interface', 0xBE00, 0xBE7F);
ExidyMemoryTypes.DiskSystemRom = new MemoryType(2, 'Disk system ROM', 0xBC00, 0xBCFF);
ExidyMemoryTypes.Ram = new MemoryType(1, 'RAM', 0x0000, 0xBFFF);
ExidyMemoryTypes.None = new MemoryType(0, 'None', 0x0000, 0xFFFF);
