'use strict';
var ExidyMemoryRegionType;
(function (ExidyMemoryRegionType) {
    ExidyMemoryRegionType[ExidyMemoryRegionType["None"] = 0] = "None";
    ExidyMemoryRegionType[ExidyMemoryRegionType["Ram"] = 1] = "Ram";
    ExidyMemoryRegionType[ExidyMemoryRegionType["Rom"] = 2] = "Rom";
    ExidyMemoryRegionType[ExidyMemoryRegionType["DiskSystem"] = 3] = "DiskSystem";
})(ExidyMemoryRegionType || (ExidyMemoryRegionType = {}));
export default ExidyMemoryRegionType;
