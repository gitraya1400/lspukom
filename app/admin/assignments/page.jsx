// frontend-lms-v3-master/app/admin/assignments/page.jsx

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  mockGetAsesiUsers,
  mockGetAsesorUsers,
  mockGetUnitsForSkema,
  mockAssignAsesorPerUnit,
  mockGetAllSkema,
} from "@/lib/api-mock";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Search, ChevronLeft, ChevronRight, User, Sparkles, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ITEMS_PER_PAGE = 20;

const formatUnitList = (unitList) => {
  if (unitList.length === 0) return "";
  if (unitList.length === 1) return `"${unitList[0]}"`;
  
  const firstParts = unitList.slice(0, unitList.length - 1);
  const lastPart = unitList[unitList.length - 1];
  
  return `${firstParts.map(u => `"${u}"`).join(', ')} dan "${lastPart}"`;
}

export default function AssignmentsPage() {
  const [skemaId, setSkemaId] = useState("")
  const [tipeUjian, setTipeUjian] = useState("TEORI")

  const [allAsesi, setAllAsesi] = useState([])
  const [allAsesor, setAllAsesor] = useState([])
  const [units, setUnits] = useState([])

  const [asesiList, setAsesiList] = useState([])
  const [asesorList, setAsesorList] = useState([])

  const [loading, setLoading] = useState(true)
  const [savingAsesiId, setSavingAsesiId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const [filterKelas, setFilterKelas] = useState("SEMUA") 

  const [teoriAssignments, setTeoriAssignments] = useState({})
  const [praktikumAssignments, setPraktikumAssignments] = useState({})
  const [unjukDiriAssignments, setUnjukDiriAssignments] = useState({})

  const [selectedBulkClass, setSelectedBulkClass] = useState("")
  const [selectedBulkAsesor, setSelectedBulkAsesor] = useState("")
  const [selectedBulkUnitStart, setSelectedBulkUnitStart] = useState("")
  const [selectedBulkUnitEnd, setSelectedBulkUnitEnd] = useState("")

  const [selectedBulkClassPraktikum, setSelectedBulkClassPraktikum] = useState("")
  const [selectedBulkAsesorPraktikum, setSelectedBulkAsesorPraktikum] = useState("")
  const [selectedBulkClassUnjukDiri, setSelectedBulkClassUnjukDiri] = useState("")
  const [selectedBulkAsesorUnjukDiri, setSelectedBulkAsesorUnjukDiri] = useState("")

  const [skemaList, setSkemaList] = useState([])
  const [loadingSkema, setLoadingSkema] = useState(true)

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false)
  const [overlapWarning, setOverlapWarning] = useState(null)
  const [pendingBulkAssign, setPendingBulkAssign] = useState(null)
  
  const [successDialog, setSuccessDialog] = useState({ open: false, message: "" });
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });

  const dropdownProps = {
    className: "max-h-60 overflow-y-auto" 
  };

  useEffect(() => {
    loadMasterData()
    loadSkemaList()
  }, [])

  useEffect(() => {
    if (skemaId) {
      loadSkemaData()
    }
  }, [skemaId])

  useEffect(() => {
    if (!skemaId) return

    const filteredAsesi = allAsesi.filter((a) => a.skemaId === skemaId)
    setAsesiList(filteredAsesi)
    const filteredAsesor = allAsesor.filter((a) => a.skemaKeahlian && a.skemaKeahlian.includes(skemaId))
    setAsesorList(filteredAsesor)

     setCurrentPage(1)
    setFilterKelas("SEMUA") 
    setSelectedBulkClass("")
    setSelectedBulkAsesor("")
    setSelectedBulkUnitStart("")
    setSelectedBulkUnitEnd("")
    setSelectedBulkClassPraktikum("")
    setSelectedBulkAsesorPraktikum("")
    setSelectedBulkClassUnjukDiri("")
    setSelectedBulkAsesorUnjukDiri("")
  }, [skemaId, allAsesi, allAsesor])

  const loadSkemaList = async () => {
    try {
      setLoadingSkema(true)
      const data = await mockGetAllSkema()
      setSkemaList(data)
      if (data.length > 0) {
        setSkemaId(data[0].id)
      }
    } catch (error) {
      console.error("Error loading skema list:", error)
    } finally {
      setLoadingSkema(false)
    }
  }

  const loadMasterData = async () => {
    try {
      setLoading(true)
      const [asesiData, asesorData] = await Promise.all([mockGetAsesiUsers(), mockGetAsesorUsers()])
      setAllAsesi(asesiData)
      setAllAsesor(asesorData)
    } catch (error) {
      console.error("Error loading master data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSkemaData = async () => {
    try {
      setLoading(true)
      const unitsData = await mockGetUnitsForSkema(skemaId)
      setUnits(unitsData)
    } catch (error) {
      console.error("Error loading skema data:", error)
    } finally {
      setLoading(false)
    }
  }

  const kelasList = useMemo(() => {
    const kelasSet = new Set(asesiList.map((a) => a.kelas).filter(Boolean))
    return Array.from(kelasSet).sort()
  }, [asesiList])

  const unitOptions = useMemo(() => {
    return units.map((u) => ({
      value: String(u.nomorUnit),
      label: `Unit ${u.nomorUnit}: ${u.judul}`,
    }))
  }, [units])

  const filteredAsesi = useMemo(() => {
    return asesiList.filter((a) => {
      const matchSearch =
        a.nama.toLowerCase().includes(searchTerm.toLowerCase()) || (a.nim && a.nim.includes(searchTerm))
      const matchKelas = filterKelas === "SEMUA" || a.kelas === filterKelas
      return matchSearch && matchKelas
    })
  }, [asesiList, searchTerm, filterKelas]) 

  const paginatedAsesi = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredAsesi.slice(start, end)
  }, [filteredAsesi, currentPage])

  const totalPages = Math.ceil(filteredAsesi.length / ITEMS_PER_PAGE)

  const isAllFilteredAsesiFullyAssigned = useMemo(() => {
    if (filteredAsesi.length === 0 || units.length === 0) {
      return false; 
    }
    return filteredAsesi.every(asesi => 
      units.every(unit => 
        teoriAssignments[`${asesi.id}-${unit.id}`]
      )
    );
  }, [filteredAsesi, units, teoriAssignments]);

  // Validasi untuk Simpan Semua Praktikum
  const isPraktikumSaveAllValid = useMemo(() => {
    const asesiToSave = filteredAsesi.filter((asesi) => praktikumAssignments[asesi.id]);
    
    if (asesiToSave.length === 0) {
      return false;
    }
    
    // Validasi: jika ada penugasan cepat, pastikan filter sesuai
    if (selectedBulkClassPraktikum && filterKelas !== selectedBulkClassPraktikum) {
      return false;
    }
    
    return true;
  }, [filteredAsesi, praktikumAssignments, selectedBulkClassPraktikum, filterKelas]);

  // Validasi untuk Simpan Semua Unjuk Diri
  const isUnjukDiriSaveAllValid = useMemo(() => {
    const asesiToSave = filteredAsesi.filter((asesi) => unjukDiriAssignments[asesi.id]);
    
    if (asesiToSave.length === 0) {
      return false;
    }
    
    // Validasi: jika ada penugasan cepat, pastikan filter sesuai
    if (selectedBulkClassUnjukDiri && filterKelas !== selectedBulkClassUnjukDiri) {
      return false;
    }
    
    return true;
  }, [filteredAsesi, unjukDiriAssignments, selectedBulkClassUnjukDiri, filterKelas]);

  const handleTeoriAssignmentChange = (asesiId, unitId, asesorId) => {
    setTeoriAssignments((prev) => ({
      ...prev,
      [`${asesiId}-${unitId}`]: asesorId,
    }))
  }
  const handlePraktikumAssignmentChange = (asesiId, asesorId) => {
    setPraktikumAssignments((prev) => ({ ...prev, [asesiId]: asesorId }))
  }
  const handleUnjukDiriAssignmentChange = (asesiId, asesorId) => {
    setUnjukDiriAssignments((prev) => ({ ...prev, [asesiId]: asesorId }))
  }

  const handleSaveAssignments = async (asesiId, assignmentsData, asesiNama = null) => {
    setSavingAsesiId(asesiId)
    if (assignmentsData.length === 0) {
      setSuccessDialog({ open: true, message: "Belum ada asesor yang ditugaskan untuk asesi ini." });
      setSavingAsesiId(null)
      return
    }
    
    try {
      await mockAssignAsesorPerUnit(asesiId, assignmentsData)
      
      let message = "";
      if (asesiNama) {
        // Pesan untuk simpan per baris
        message = `Berhasil menyimpan penugasan asesor untuk ${asesiNama}.`;
      } else {
        // Pesan untuk simpan Praktikum/Unjuk Diri per baris
        message = `Penugasan untuk asesi (ID: ${asesiId}) berhasil disimpan!`;
      }
      setSuccessDialog({ open: true, message: message });

    } catch (error) {
      console.error("Error saving assignments:", error)
      setSuccessDialog({ open: true, message: "Gagal menyimpan penugasan: " + error.message });
    } finally {
      setSavingAsesiId(null)
    }
  }

  const handleSaveTeori = (asesiId, asesiNama) => {
    const allAssigned = units.every((unit) => teoriAssignments[`${asesiId}-${unit.id}`]);
    if (!allAssigned) {
      setSuccessDialog({ open: true, message: "Gagal: Pastikan semua unit kompetensi memiliki asesor sebelum menyimpan." });
      return
    }

    const assignmentsForAsesi = units.map((unit) => ({
      unitId: unit.nomorUnit,
      tipe: "TEORI",
      asesorId: teoriAssignments[`${asesiId}-${unit.id}`],
    }));
    
    handleSaveAssignments(asesiId, assignmentsForAsesi, asesiNama);
  }

  const handleSavePraktikum = (asesiId, asesiNama) => {
    const asesorId = praktikumAssignments[asesiId]
    if (!asesorId) {
      setSuccessDialog({ open: true, message: "Pilih seorang asesor terlebih dahulu." });
      return
    }
    handleSaveAssignments(asesiId, [
      {
        tipe: "PRAKTIKUM",
        unitId: null,
        asesorId: asesorId,
      },
    ], asesiNama)
  }

  const handleSaveUnjukDiri = (asesiId, asesiNama) => {
    const asesorId = unjukDiriAssignments[asesiId]
    if (!asesorId) {
      setSuccessDialog({ open: true, message: "Pilih seorang asesor terlebih dahulu." });
      return
    }
    handleSaveAssignments(asesiId, [
      {
        tipe: "UNJUK_DIRI",
        unitId: null,
        asesorId: asesorId,
      },
    ], asesiNama)
  }

  const executeBulkAssign = (kelas, asesorId, setAssignmentsFunc, tipe) => {
    const asesiInClass = asesiList.filter((a) => a.kelas === kelas).map((a) => a.id)
    if (asesiInClass.length === 0) {
      setSuccessDialog({ open: true, message: "Tidak ada asesi di kelas ini." });
      return
    }

    setAssignmentsFunc((prev) => {
      const newAssignments = { ...prev }
      for (const asesiId of asesiInClass) {
        if (tipe === "TEORI") {
          const startUnitNum = Number.parseInt(selectedBulkUnitStart)
          const endUnitNum = Number.parseInt(selectedBulkUnitEnd)
          const unitsToAssign = units
            .filter((u) => u.nomorUnit >= startUnitNum && u.nomorUnit <= endUnitNum)
            .map((u) => u.id)

          for (const unitId of unitsToAssign) {
            newAssignments[`${asesiId}-${unitId}`] = asesorId
          }
        } else {
          newAssignments[asesiId] = asesorId
        }
      }
      return newAssignments
    })

    const asesorNama = asesorList.find((a) => a.id === asesorId)?.nama || "Asesor"
    setSuccessDialog({ open: true, message: `Berhasil menerapkan ${asesorNama} ke ${asesiInClass.length} asesi di kelas ${kelas}.` });

    setPendingBulkAssign(null);
    setIsOverlapDialogOpen(false);
  }

  const applyBulkAssign = (kelas, asesorId, setAssignmentsFunc, tipe) => {
    if (!kelas || !asesorId) {
      setErrorDialog({ open: true, message: "Harap pilih Kelas dan Asesor." });
      return
    }

    if (tipe === "TEORI") {
      if (!selectedBulkUnitStart || !selectedBulkUnitEnd) {
        setErrorDialog({ open: true, message: "Harap pilih rentang unit (Dari Unit dan Sampai Unit)." });
        return
      }
      
      const asesiInClass = asesiList.filter((a) => a.kelas === kelas);
      if (asesiInClass.length === 0) {
        setErrorDialog({ open: true, message: "Tidak ada asesi di kelas ini." });
        return;
      }
      
      const startUnitNum = Number.parseInt(selectedBulkUnitStart);
      const endUnitNum = Number.parseInt(selectedBulkUnitEnd);
      const unitsToAssign = units.filter((u) => u.nomorUnit >= startUnitNum && u.nomorUnit <= endUnitNum);
      
      const asesorListMap = new Map(asesorList.map(a => [a.id, a.nama]));
      const newAsesorNama = asesorListMap.get(asesorId) || "Asesor Baru";

      let firstConflictAsesiId = null;
let firstConflictAsesiNama = "";
let conflictsByAsesor = {}; // { asesorId: { asesorNama: "...", units: [...] } }

let firstClassAsesorId = null;
let isMixedAssignment = false;
let totalAssignedAsesiCount = 0;

for (const asesi of asesiInClass) {
  let hasAnyAssignment = false;
  
  for (const unit of unitsToAssign) {
    const key = `${asesi.id}-${unit.id}`;
    const currentAsesorId = teoriAssignments[key];

    if (currentAsesorId) {
      hasAnyAssignment = true;
      
      if (firstClassAsesorId === null) {
        firstClassAsesorId = currentAsesorId;
      } else if (currentAsesorId !== firstClassAsesorId) {
        isMixedAssignment = true;
      }

      if (currentAsesorId !== asesorId) {
        const currentAsesorNama = asesorListMap.get(currentAsesorId) || "Asesor Lain";
        
        if (firstConflictAsesiId === null) {
          firstConflictAsesiId = asesi.id;
          firstConflictAsesiNama = asesi.nama;
        }
        
        // Kumpulkan semua konflik berdasarkan asesor
        if (!conflictsByAsesor[currentAsesorId]) {
          conflictsByAsesor[currentAsesorId] = {
            asesorNama: currentAsesorNama,
            units: []
          };
        }
        
        const unitText = `Unit ${unit.nomorUnit}: ${unit.judul}`;
        if (!conflictsByAsesor[currentAsesorId].units.includes(unitText)) {
          conflictsByAsesor[currentAsesorId].units.push(unitText);
        }
      }
    }
  }
  
  if (hasAnyAssignment) {
    totalAssignedAsesiCount++;
  }
}

if (totalAssignedAsesiCount > 0 && totalAssignedAsesiCount < asesiInClass.length) {
  isMixedAssignment = true;
}

      const pendingAction = () => executeBulkAssign(kelas, asesorId, setAssignmentsFunc, tipe);

      if (firstConflictAsesiId === null) {
        pendingAction();
        return;
      }

      if (isMixedAssignment) {
  // Buat pesan untuk setiap asesor yang berbeda
  const conflictMessages = Object.values(conflictsByAsesor).map((conflict, index) => {
    const unitText = formatUnitList(conflict.units);
    return (
      <span key={index}>
        {unitText} sudah terisi oleh <strong>{conflict.asesorNama}</strong>
      </span>
    );
  });
  
  // Gabungkan pesan dengan koma dan "dan"
  const formattedMessages = conflictMessages.reduce((acc, curr, idx) => {
    if (idx === 0) return [curr];
    if (idx === conflictMessages.length - 1) {
      return [...acc, ' dan ', curr];
    }
    return [...acc, ', ', curr];
  }, []);
  
  const warning = (
    <span>
      {formattedMessages} pada asesi <strong>{firstConflictAsesiNama}</strong>. 
      Apakah Anda yakin ingin menggantinya dengan <strong>{newAsesorNama}</strong>? 
      (Perubahan ini akan berlaku untuk semua asesi di kelas <strong>{kelas}</strong>)
    </span>
  );
  
  setOverlapWarning(warning);
  setPendingBulkAssign({ action: pendingAction });
  setIsOverlapDialogOpen(true);
} else {
  if (firstClassAsesorId === asesorId) {
    pendingAction();
    return;
  }

  const actuallyAssignedUnits = [];
  for (const unit of unitsToAssign) {
    let isUnitAssignedInClass = false;
    for (const asesi of asesiInClass) {
      const key = `${asesi.id}-${unit.id}`;
      if (teoriAssignments[key]) {
        isUnitAssignedInClass = true;
        break;
      }
    }
    if (isUnitAssignedInClass) {
      actuallyAssignedUnits.push(`Unit ${unit.nomorUnit}: ${unit.judul}`);
    }
  }

  const unitText = formatUnitList(actuallyAssignedUnits);
  const oldAsesorNama = asesorListMap.get(firstClassAsesorId) || "Asesor Lain";
  const warning = (
    <span>
      {unitText} di kelas <strong>{kelas}</strong> sudah terisi oleh <strong>{oldAsesorNama}</strong>. 
      Apakah Anda yakin akan menggantinya dengan <strong>{newAsesorNama}</strong>?
    </span>
  );
  
  setOverlapWarning(warning);
  setPendingBulkAssign({ action: pendingAction });
  setIsOverlapDialogOpen(true);
}

    } else {
      // Untuk Praktikum & Unjuk Diri, tidak ada cek overlap
      executeBulkAssign(kelas, asesorId, setAssignmentsFunc, tipe);
    }
  }

  const handleBulkAssignTeori = () => {
    if (!selectedBulkUnitStart || !selectedBulkUnitEnd || !selectedBulkClass || !selectedBulkAsesor) {
      setErrorDialog({ open: true, message: "Harap lengkapi semua field: Kelas, Asesor, Dari Unit, dan Sampai Unit." });
      return
    }
    const startUnitNum = Number.parseInt(selectedBulkUnitStart)
    const endUnitNum = Number.parseInt(selectedBulkUnitEnd)
    if (startUnitNum > endUnitNum) {
      setErrorDialog({ open: true, message: "Unit Awal tidak boleh lebih besar dari Unit Akhir. Silahkan periksa kembali urutan unit Anda." });
      return
    }
    applyBulkAssign(selectedBulkClass, selectedBulkAsesor, setTeoriAssignments, "TEORI")
  }
  const handleBulkAssignPraktikum = () => {
    applyBulkAssign(selectedBulkClassPraktikum, selectedBulkAsesorPraktikum, setPraktikumAssignments, "PRAKTIKUM")
  }
  const handleBulkAssignUnjukDiri = () => {
    applyBulkAssign(selectedBulkClassUnjukDiri, selectedBulkAsesorUnjukDiri, setUnjukDiriAssignments, "UNJUK_DIRI")
  }
  
  const handleConfirmOverlap = () => {
    if (pendingBulkAssign && typeof pendingBulkAssign.action === 'function') {
      pendingBulkAssign.action(); 
    }
    setIsOverlapDialogOpen(false);
    setOverlapWarning(null);
    setPendingBulkAssign(null);
  }

  const handleSaveAllTeori = async () => {
    let successCount = 0
    let failCount = 0
    setSavingAsesiId("all")

    try {
      for (const asesi of filteredAsesi) {
        const allAssigned = units.every((unit) => teoriAssignments[`${asesi.id}-${unit.id}`]);
        
        if (!allAssigned) {
          console.warn(`Asesi ${asesi.id} dilewati karena data unit tidak lengkap.`);
          failCount++;
          continue;
        }

        const assignmentsForAsesi = units.map((unit) => ({
          unitId: unit.nomorUnit,
          tipe: "TEORI",
          asesorId: teoriAssignments[`${asesi.id}-${unit.id}`],
        }))

        try {
          await mockAssignAsesorPerUnit(asesi.id, assignmentsForAsesi)
          successCount++
        } catch (error) {
          console.error(`Gagal simpan asesi ${asesi.id}:`, error)
          failCount++
        }
      }

      let successMessage;
      if (filterKelas !== "SEMUA") {
        successMessage = `Penugasan asesor di kelas ${filterKelas} berhasil disimpan untuk ${successCount} asesi.`;
      } else {
        successMessage = `Berhasil menyimpan ${successCount} asesi dari semua kelas yang tampil.`;
      }
      if (failCount > 0) {
        successMessage += ` ${failCount} asesi gagal disimpan (data unit belum lengkap).`;
      }
      setSuccessDialog({ open: true, message: successMessage });

    } catch (error) {
      setSuccessDialog({ open: true, message: "Error saat menyimpan semua penugasan" });
    } finally {
      setSavingAsesiId(null)
    }
  }

  const handleSaveAllPraktikum = async () => {
    // Validasi kesesuaian kelas
    if (selectedBulkClassPraktikum && filterKelas !== selectedBulkClassPraktikum) {
      setErrorDialog({ 
        open: true, 
        message: "Filter kelas tidak sesuai dengan kelas di penugasan cepat. Silakan sesuaikan filter kelas terlebih dahulu." 
      });
      return;
    }
    
    const asesiToSave = filteredAsesi.filter((asesi) => praktikumAssignments[asesi.id])
    
    if (asesiToSave.length === 0) {
      setSuccessDialog({ open: true, message: "Tidak ada asesi dengan asesor yang dipilih (di seluruh filter) untuk disimpan." });
      return
    }
    let successCount = 0
    let failCount = 0
    setSavingAsesiId("all")
    try {
      for (const asesi of asesiToSave) {
        const asesorId = praktikumAssignments[asesi.id]
        if (!asesorId) {
          failCount++
          continue
        }
        try {
          await mockAssignAsesorPerUnit(asesi.id, [
            { tipe: "PRAKTIKUM", unitId: null, asesorId: asesorId },
          ])
          successCount++
        } catch (error) {
          failCount++
        }
      }
      
      let successMessage;
      if (filterKelas !== "SEMUA") {
        successMessage = `Penugasan praktikum di kelas ${filterKelas} berhasil disimpan untuk ${successCount} asesi.`;
      } else {
        successMessage = `Berhasil menyimpan ${successCount} asesi.`;
      }
      if (failCount > 0) {
        successMessage += ` ${failCount} asesi gagal.`;
      }
      setSuccessDialog({ open: true, message: successMessage });

    } catch (error) {
      setSuccessDialog({ open: true, message: "Error saat menyimpan semua penugasan" });
    } finally {
      setSavingAsesiId(null)
    }
  }

  const handleSaveAllUnjukDiri = async () => {
    // Validasi kesesuaian kelas
    if (selectedBulkClassUnjukDiri && filterKelas !== selectedBulkClassUnjukDiri) {
      setErrorDialog({ 
        open: true, 
        message: "Filter kelas tidak sesuai dengan kelas di penugasan cepat. Silakan sesuaikan filter kelas terlebih dahulu." 
      });
      return;
    }
    
    const asesiToSave = filteredAsesi.filter((asesi) => unjukDiriAssignments[asesi.id])

    if (asesiToSave.length === 0) {
      setSuccessDialog({ open: true, message: "Tidak ada asesi dengan asesor yang dipilih (di seluruh filter) untuk disimpan." });
      return
    }
    let successCount = 0
    let failCount = 0
    setSavingAsesiId("all")
    try {
      for (const asesi of asesiToSave) {
        const asesorId = unjukDiriAssignments[asesi.id]
        if (!asesorId) {
          failCount++
          continue
        }
        try {
          await mockAssignAsesorPerUnit(asesi.id, [
            { tipe: "UNJUK_DIRI", unitId: null, asesorId: asesorId },
          ])
          successCount++
        } catch (error) {
          failCount++
        }
      }
      
      let successMessage;
      if (filterKelas !== "SEMUA") {
        successMessage = `Penugasan unjuk diri di kelas ${filterKelas} berhasil disimpan untuk ${successCount} asesi.`;
      } else {
        successMessage = `Berhasil menyimpan ${successCount} asesi.`;
      }
      if (failCount > 0) {
        successMessage += ` ${failCount} asesi gagal.`;
      }
      setSuccessDialog({ open: true, message: successMessage });

    } catch (error) {
      setSuccessDialog({ open: true, message: "Error saat menyimpan semua penugasan" });
    } finally {
      setSavingAsesiId(null)
    }
  }
  
  return (
    <MainLayout>
      <div className="flex-1 p-6 space-y-6 w-full">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Penugasan Asesor</h1>
          <p className="text-gray-600 mt-1">
            Atur penugasan asesor untuk Ujian Teori (per unit), Ujian Praktikum, dan Unjuk Diri.
          </p>
        </div>

        {/* KARTU FILTER (Layout sudah di-flex) */}
        <Card>
          <CardContent className="pt-6 space-y-4">

            <Alert className="bg-blue-50 border-blue-200 text-blue-900">
              <Info className="h-4 w-4 text-blue-700" />
              <AlertDescription className="block text-blue-900">
                <b>Tips:</b> Untuk menggunakan <strong>"Penugasan Cepat"</strong> dan <strong>"Simpan Semua"</strong> dengan optimal, pastikan:
                <br />1. Filter Kelas di atas sesuai dengan kelas yang akan ditugaskan
                <br />2. Tombol <strong>"Simpan Semua"</strong> hanya aktif ketika filter kelas sesuai
              </AlertDescription>
            </Alert>

            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              
              {/* Kolom 1: Skema (Lebar tetap) */}
              <div className="md:w-64">
                <label className="text-sm font-medium block mb-1.5">Skema</label>
                <Select value={skemaId} onValueChange={setSkemaId} disabled={loadingSkema}>
                  <SelectTrigger className="border-gray-300 bg-white">
                    <SelectValue placeholder="Memuat skema..." />
                  </SelectTrigger>
                  {/* --- PERBAIKAN DROPDOWN: Menambahkan ...dropdownProps --- */}
                  <SelectContent {...dropdownProps}>
                    {skemaList.length === 0 && !loadingSkema ? (
                      <SelectItem value="" disabled>
                        Tidak ada skema
                      </SelectItem>
                    ) : (
                      skemaList.map((skema) => (
                        <SelectItem key={skema.id} value={skema.id}>
                          {skema.judul} ({skema.id})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Kolom 2: Filter Kelas (Lebar tetap) */}
              <div className="md:w-48">
                <label className="text-sm font-medium block mb-1.5">Filter Kelas</label>
                <Select value={filterKelas} onValueChange={setFilterKelas}>
                  <SelectTrigger className="border-gray-300 bg-white">
                    <SelectValue placeholder="Semua Kelas" />
                  </SelectTrigger>
                  {/* --- PERBAIKAN DROPDOWN: Menambahkan ...dropdownProps --- */}
                  <SelectContent {...dropdownProps}>
                    <SelectItem value="SEMUA">-- Semua Kelas --</SelectItem>
                    {kelasList.map((kelas) => (
                      <SelectItem key={kelas} value={kelas}>
                        {kelas}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kolom 3: Search Asesi (Fleksibel) */}
              <div className="flex-1 w-full">
                <label className="text-sm font-medium block mb-1.5">Cari Asesi</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Cari nama atau NIM..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>
            </div>

            {/* Tipe Ujian Tabs */}
            <Tabs value={tipeUjian} onValueChange={setTipeUjian}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="TEORI">Ujian Teori (Per Unit)</TabsTrigger>
                <TabsTrigger value="PRAKTIKUM">Ujian Praktikum (Umum)</TabsTrigger>
                <TabsTrigger value="UNJUK_DIRI">Unjuk Diri (Umum)</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Card Konten Dinamis berdasarkan Tab */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              Penugasan Skema {skemaId} - {tipeUjian}
            </CardTitle>
            <CardDescription>
              Menampilkan {paginatedAsesi.length} dari {filteredAsesi.length} asesi
              {filterKelas !== "SEMUA" && ` (kelas ${filterKelas})`}.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <>
                {/* Tampilan Matrix untuk TEORI */}
                {tipeUjian === "TEORI" && (
                  <div className="space-y-4">
                    <div className="p-4 border-b">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        Penugasan Cepat Ujian Teori
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
                        <Select value={selectedBulkClass} onValueChange={setSelectedBulkClass}>
                          <SelectTrigger>
                            <SelectValue placeholder="-- Pilih Kelas --" />
                          </SelectTrigger>
                          {/* --- PERBAIKAN DROPDOWN: Menambahkan ...dropdownProps --- */}
                          <SelectContent {...dropdownProps}>
                            {kelasList.map((kelas) => (
                              <SelectItem key={kelas} value={kelas}>
                                {kelas}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedBulkAsesor} onValueChange={setSelectedBulkAsesor}>
                          <SelectTrigger>
                            <SelectValue placeholder="-- Pilih Asesor --" />
                          </SelectTrigger>
                          {/* --- PERBAIKAN DROPDOWN: Menambahkan ...dropdownProps --- */}
                          <SelectContent {...dropdownProps}>
                            {asesorList.map((asesor) => (
                              <SelectItem key={asesor.id} value={asesor.id}>
                                {asesor.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedBulkUnitStart} onValueChange={setSelectedBulkUnitStart}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="-- Dari Unit --" />
                          </SelectTrigger>
                          {/* --- PERBAIKAN DROPDOWN: Menambahkan ...dropdownProps --- */}
                          <SelectContent {...dropdownProps}>
                            {unitOptions.map((u) => (
-  <SelectItem key={u.value} value={u.value}>
-    {u.label}
-  </SelectItem>
+  <SelectItem key={`${skemaId}-${u.value}`} value={u.value}>
+    {u.label}
+  </SelectItem>
))}

                          </SelectContent>
                        </Select>
                        <Select value={selectedBulkUnitEnd} onValueChange={setSelectedBulkUnitEnd}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="-- Sampai Unit --" />
                          </SelectTrigger>
                          {/* --- PERBAIKAN DROPDOWN: Menambahkan ...dropdownProps --- */}
                          <SelectContent {...dropdownProps}>
                            {unitOptions.map((u) => (
-  <SelectItem key={u.value} value={u.value}>
-    {u.label}
-  </SelectItem>
+  <SelectItem key={`${skemaId}-${u.value}`} value={u.value}>
+    {u.label}
+  </SelectItem>
))}

                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleBulkAssignTeori}
                          disabled={
                            !selectedBulkClass || !selectedBulkAsesor || !selectedBulkUnitStart || !selectedBulkUnitEnd
                          }
                        >
                          Terapkan ke Kelas
                        </Button>
                        <Button
                          onClick={handleSaveAllTeori}
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={savingAsesiId === "all" || !isAllFilteredAsesiFullyAssigned}
                          title={!isAllFilteredAsesiFullyAssigned ? "Pastikan semua asesi di filter ini (termasuk di halaman lain) terisi penuh" : "Simpan semua penugasan"}
                        >
                          {savingAsesiId === "all" ? (
                            <>
                              <Spinner className="w-4 h-4 mr-2" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Simpan Semua
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-[20%] sticky left-0 bg-gray-50 z-10">Asesi</TableHead>
                            {units.map((unit) => (
                              <TableHead key={unit.id} className="text-sm text-center min-w-[100px]">
                                <div className="truncate px-2" title={`Unit ${unit.nomorUnit}: ${unit.judul}`}>
                                  Unit {unit.nomorUnit}
                                </div>
                              </TableHead>
                            ))}
                            <TableHead className="text-center sticky right-0 bg-gray-50 z-10 min-w-[80px]">
                              Aksi
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedAsesi.map((asesi) => {
                            const isThisAsesiSaving = savingAsesiId === asesi.id
                            // --- (Modifikasi) Logika tombol Simpan ---
                            const areAllUnitsAssigned = units.every(
                              (unit) => teoriAssignments[`${asesi.id}-${unit.id}`],
                            )

                            return (
                              <TableRow key={asesi.id} className="hover:bg-gray-50">
                                <TableCell className="w-[20%] sticky left-0 bg-white z-10">
                                  <p className="font-medium text-gray-900 truncate">{asesi.nama}</p>
                                  <p className="text-sm text-gray-500">{asesi.nim}</p>
                                  {asesi.kelas && (
                                    <span className="text-xs text-blue-600 font-medium">{asesi.kelas}</span>
                                  )}
                                </TableCell>
                                {units.map((unit) => {
                                  const assignmentKey = `${asesi.id}-${unit.id}`
                                  const currentAsesorId = teoriAssignments[assignmentKey] || ""
                                  const asesorName = asesorList.find((a) => a.id === currentAsesorId)?.nama || ""
                                  return (
                                    <TableCell key={unit.id} className="text-center min-w-[100px]">
                                      <Select
                                        value={currentAsesorId}
                                        onValueChange={(value) => handleTeoriAssignmentChange(asesi.id, unit.id, value)}
                                      >
                                        <SelectTrigger className="bg-gray-50 w-full text-xs">
                                          <SelectValue placeholder="-- Pilih --" />
                                        </SelectTrigger>
                                        {/* --- PERBAIKAN DROPDOWN: Menambahkan ...dropdownProps --- */}
                                        <SelectContent {...dropdownProps}>
                                          {asesorList.map((asesor) => (
                                            <SelectItem key={asesor.id} value={asesor.id}>
                                              {asesor.nama}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                  )
                                })}
                                <TableCell className="text-center sticky right-0 bg-white z-10 min-w-[80px]">
                                  {/* --- (Modifikasi) Logika 'disabled' diubah --- */}
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveTeori(asesi.id, asesi.nama)}
                                    disabled={isThisAsesiSaving || !areAllUnitsAssigned}
                                    title={
                                      !areAllUnitsAssigned
                                        ? "Harap tugaskan asesor untuk SEMUA unit"
                                        : "Simpan Penugasan"
                                    }
                                  >
                                    {isThisAsesiSaving ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Tampilan untuk PRAKTIKUM */}
                {tipeUjian === "PRAKTIKUM" && (
                  <div className="space-y-4">
                    <div className="p-4 border-b">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        Penugasan Cepat Praktikum
                      </h4>
                      <div className="flex gap-3 items-end flex-wrap mb-4">
                        <div className="flex-1 min-w-[200px]">
                          <Select value={selectedBulkClassPraktikum} onValueChange={setSelectedBulkClassPraktikum}>
                            <SelectTrigger>
                              <SelectValue placeholder="-- Pilih Kelas --" />
                            </SelectTrigger>
                            {/* --- PERBAIKAN DROPDOWN: Menambahkan ...dropdownProps --- */}
                            <SelectContent {...dropdownProps}>
                              {kelasList.map((kelas) => (
                                <SelectItem key={kelas} value={kelas}>
                                  {kelas}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <Select value={selectedBulkAsesorPraktikum} onValueChange={setSelectedBulkAsesorPraktikum}>
                            <SelectTrigger>
                              <SelectValue placeholder="-- Pilih Asesor --" />
                            </SelectTrigger>
                            {/* --- PERBAIKAN DROPDOWN: Menambahkan ...dropdownProps --- */}
                            <SelectContent {...dropdownProps}>
                              {asesorList.map((asesor) => (
                                <SelectItem key={asesor.id} value={asesor.id}>
                                  {asesor.nama}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={handleBulkAssignPraktikum}
                          disabled={!selectedBulkClassPraktikum || !selectedBulkAsesorPraktikum}
                        >
                          Terapkan ke Kelas
                        </Button>
                        <Button
                          onClick={handleSaveAllPraktikum}
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={savingAsesiId === "all" || !isPraktikumSaveAllValid}
                          title={
                            !isPraktikumSaveAllValid 
                              ? selectedBulkClassPraktikum && filterKelas !== selectedBulkClassPraktikum
                                ? "Pastikan filter kelas sesuai dengan kelas di penugasan cepat"
                                : "Tidak ada asesi dengan asesor yang dipilih untuk disimpan"
                              : "Simpan semua penugasan"
                          }
                        >
                          {savingAsesiId === "all" ? (
                            <>
                              <Spinner className="w-4 h-4 mr-2" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Simpan Semua
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-[35%]">Asesi</TableHead>
                            <TableHead className="w-[40%]">Asesor Penilai</TableHead>
                            <TableHead className="w-[25%] text-center">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedAsesi.map((asesi) => {
                            const isSaving = savingAsesiId === asesi.id
                            const currentAsesorId = praktikumAssignments[asesi.id] || ""
                            return (
                              <TableRow key={asesi.id} className="hover:bg-gray-50">
                                <TableCell className="w-[35%]">
                                  <p className="font-medium text-gray-900">{asesi.nama}</p>
                                  <p className="text-sm text-gray-500">{asesi.nim}</p>
                                  {asesi.kelas && (
                                    <span className="text-xs text-blue-600 font-medium">{asesi.kelas}</span>
                                  )}
                                </TableCell>
                                <TableCell className="w-[40%]">
                                  <Select
                                    value={currentAsesorId}
                                    onValueChange={(value) => handlePraktikumAssignmentChange(asesi.id, value)}
                                  >
                                    <SelectTrigger className="bg-gray-50 w-full">
                                      <SelectValue placeholder="-- Pilih Asesor --" />
                                    </SelectTrigger>
                                    {/* --- PERBAIKAN DROPDOWN: Menambahkan ...dropdownProps --- */}
                                    <SelectContent {...dropdownProps}>
                                      {asesorList.map((asesor) => (
                                        <SelectItem key={asesor.id} value={asesor.id}>
                                          {asesor.nama}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="w-[25%] text-center">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSavePraktikum(asesi.id, asesi.nama)}
                                    disabled={isSaving || !currentAsesorId}
                                    title={!currentAsesorId ? "Pilih asesor terlebih dahulu" : "Simpan"}
                                  >
                                    {isSaving ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Tampilan untuk UNJUK DIRI */}
                {tipeUjian === "UNJUK_DIRI" && (
                  <div className="space-y-4">
                    <div className="p-4 border-b">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        Penugasan Cepat Unjuk Diri
                      </h4>
                      <div className="flex gap-3 items-end flex-wrap mb-4">
                        <div className="flex-1 min-w-[200px]">
                          <Select value={selectedBulkClassUnjukDiri} onValueChange={setSelectedBulkClassUnjukDiri}>
                            <SelectTrigger>
                              <SelectValue placeholder="-- Pilih Kelas --" />
                            </SelectTrigger>
                            {/* --- PERBAIKAN DROPDOWN: Menambahkan ...dropdownProps --- */}
                            <SelectContent {...dropdownProps}>
                              {kelasList.map((kelas) => (
                                <SelectItem key={kelas} value={kelas}>
                                  {kelas}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <Select value={selectedBulkAsesorUnjukDiri} onValueChange={setSelectedBulkAsesorUnjukDiri}>
                            <SelectTrigger>
                              <SelectValue placeholder="-- Pilih Asesor --" />
                            </SelectTrigger>
                            {/* --- PERBAIKAN DROPDOWN: Menambahkan ...dropdownProps --- */}
                            <SelectContent {...dropdownProps}>
                              {asesorList.map((asesor) => (
                                <SelectItem key={asesor.id} value={asesor.id}>
                                  {asesor.nama}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={handleBulkAssignUnjukDiri}
                          disabled={!selectedBulkClassUnjukDiri || !selectedBulkAsesorUnjukDiri}
                        >
                          Terapkan ke Kelas
                        </Button>
                        <Button
                          onClick={handleSaveAllUnjukDiri}
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={savingAsesiId === "all" || !isUnjukDiriSaveAllValid}
                          title={
                            !isUnjukDiriSaveAllValid 
                              ? selectedBulkClassUnjukDiri && filterKelas !== selectedBulkClassUnjukDiri
                                ? "Pastikan filter kelas sesuai dengan kelas di penugasan cepat"
                                : "Tidak ada asesi dengan asesor yang dipilih untuk disimpan"
                              : "Simpan semua penugasan"
                          }
                        >
                          {savingAsesiId === "all" ? (
                            <>
                              <Spinner className="w-4 h-4 mr-2" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Simpan Semua
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-[35%]">Asesi</TableHead>
                            <TableHead className="w-[40%]">Asesor Penilai</TableHead>
                            <TableHead className="w-[25%] text-center">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedAsesi.map((asesi) => {
                            const isSaving = savingAsesiId === asesi.id
                            const currentAsesorId = unjukDiriAssignments[asesi.id] || ""
                            return (
                              <TableRow key={asesi.id} className="hover:bg-gray-50">
                                <TableCell className="w-[35%]">
                                  <p className="font-medium text-gray-900">{asesi.nama}</p>
                                  <p className="text-sm text-gray-500">{asesi.nim}</p>
                                  {asesi.kelas && (
                                    <span className="text-xs text-blue-600 font-medium">{asesi.kelas}</span>
                                  )}
                                </TableCell>
                                <TableCell className="w-[40%]">
                                  <Select
                                    value={currentAsesorId}
                                    onValueChange={(value) => handleUnjukDiriAssignmentChange(asesi.id, value)}
                                  >
                                    <SelectTrigger className="bg-gray-50 w-full">
                                      <SelectValue placeholder="-- Pilih Asesor --" />
                                    </SelectTrigger>
                                    {/* --- PERBAIKAN DROPDOWN: Menambahkan ...dropdownProps --- */}
                                    <SelectContent {...dropdownProps}>
                                      {asesorList.map((asesor) => (
                                        <SelectItem key={asesor.id} value={asesor.id}>
                                          {asesor.nama}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="w-[25%] text-center">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveUnjukDiri(asesi.id, asesi.nama)}
                                    disabled={isSaving || !currentAsesorId}
                                    title={!currentAsesorId ? "Pilih asesor terlebih dahulu" : "Simpan"}
                                  >
                                    {isSaving ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </>
            )}
            {paginatedAsesi.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-2" />
                {filterKelas !== "SEMUA"
                  ? `Tidak ada asesi di kelas ${filterKelas} yang cocok dengan pencarian.`
                  : "Tidak ada asesi yang cocok dengan filter."}
              </div>
            )}
          </CardContent>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Dialog Overlap */}
      <AlertDialog open={isOverlapDialogOpen} onOpenChange={setIsOverlapDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-orange-500" />
              Konfirmasi Simpan Penugasan
            </AlertDialogTitle>
            <AlertDialogDescription>
              {overlapWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsOverlapDialogOpen(false);
              setOverlapWarning(null);
              setPendingBulkAssign(null);
            }}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmOverlap}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Lanjutkan dan Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dialog Sukses Kustom */}
      <AlertDialog open={successDialog.open} onOpenChange={(open) => setSuccessDialog({ ...successDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Penugasan Asesor</AlertDialogTitle>
            <AlertDialogDescription>
              {successDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSuccessDialog({ open: false, message: "" })}>
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* --- DIALOG BARU UNTUK VALIDASI ERROR --- */}
      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <AlertDialogContent className="sm:max-w-md"> {/* <-- Ukuran diperkecil */}
          <AlertDialogHeader>
            <AlertDialogTitle>Validasi Unit</AlertDialogTitle> {/* <-- Judul diubah */}
            <AlertDialogDescription>
              {errorDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* --- TOMBOL DIUBAH MENJADI "Lanjutkan" --- */}
            <AlertDialogAction onClick={() => setErrorDialog({ open: false, message: "" })}>
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </MainLayout>
  )
}