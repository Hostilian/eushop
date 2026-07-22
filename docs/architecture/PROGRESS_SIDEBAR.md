# EUshop Agent Observability & Windows Progress Sidebar Specification

**Architecture:** Native PowerShell System.Windows.Forms GUI Sidebar  
**Refresh Interval:** 4-Second Evidence Health Poll  

---

## 1. Execution State Classifier Matrix

| State Name | Condition Trigger | Health Indicator |
| :--- | :--- | :---: |
| **`WORKING`** | Active CPU time growth & Git commit within < 4 mins | `GREEN` |
| **`RUNNING`** | Background supervisor PIDs active | `BLUE` |
| **`POSSIBLY STALLED`** | Zero CPU growth for > 8 mins | `YELLOW` |
| **`DOWN`** | Process terminated | `RED` |
