'use strict';

import MemoryType from './ExidyMemoryType';

export default class ExidyMemoryTypes {

    public static UserCharacterRam: MemoryType = new MemoryType(9, 'User defined character RAM', 0xFC00, 0xFFFF);

    public static AsciiCharacterRom = new MemoryType(8, 'ASCII character ROM', 0xF800, 0xFBFF);

    public static ScreenRam = new MemoryType(7, 'Screen RAM', 0xF080, 0xF7FF);

    public static VideoScratchRam = new MemoryType(6, 'Video scratch RAM', 0xF000, 0xF07F);

    public static MonitorRom = new MemoryType(5, 'Monitor ROM', 0xE000, 0xEFFF);

    public static RomPack8K = new MemoryType(4, '8K ROM Pack', 0xC000, 0xDFFF);

    public static DiskSystemInterface: MemoryType = new MemoryType(3, 'Disk system interface', 0xBE00, 0xBE7F);

    public static DiskSystemRom = new MemoryType(2, 'Disk system ROM', 0xBC00, 0xBCFF);

    public static Ram = new MemoryType(1, 'RAM', 0x0000, 0xBFFF);

    public static None = new MemoryType(0, 'None', 0x0000, 0xFFFF);

    private static _map: Map<number, MemoryType> = null;

    private static getMap(): Map<number, MemoryType> {
        if (ExidyMemoryTypes._map === null) {
            ExidyMemoryTypes._map = new Map<number, MemoryType>();
            ExidyMemoryTypes._map[ExidyMemoryTypes.None.code] = ExidyMemoryTypes.None;
            ExidyMemoryTypes._map[ExidyMemoryTypes.Ram.code] = ExidyMemoryTypes.Ram;
            ExidyMemoryTypes._map[ExidyMemoryTypes.DiskSystemRom.code] = ExidyMemoryTypes.DiskSystemRom;
            ExidyMemoryTypes._map[ExidyMemoryTypes.DiskSystemInterface.code] = ExidyMemoryTypes.DiskSystemInterface;
            ExidyMemoryTypes._map[ExidyMemoryTypes.RomPack8K.code] = ExidyMemoryTypes.RomPack8K;
            ExidyMemoryTypes._map[ExidyMemoryTypes.MonitorRom.code] = ExidyMemoryTypes.MonitorRom;
            ExidyMemoryTypes._map[ExidyMemoryTypes.VideoScratchRam.code] = ExidyMemoryTypes.VideoScratchRam;
            ExidyMemoryTypes._map[ExidyMemoryTypes.ScreenRam.code] = ExidyMemoryTypes.ScreenRam;
            ExidyMemoryTypes._map[ExidyMemoryTypes.AsciiCharacterRom.code] = ExidyMemoryTypes.AsciiCharacterRom;
            ExidyMemoryTypes._map[ExidyMemoryTypes.UserCharacterRam.code] = ExidyMemoryTypes.UserCharacterRam;
        }
        return ExidyMemoryTypes._map;
    }

    public static getType(code: number): MemoryType {
        // TODO check the code exists in the map
        return ExidyMemoryTypes.getMap()[code];
    }
}
