export interface TranslationData {
  common: {
    dashboard: string;
    settings: string;
    logout: string;
    profile: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    yes: string;
    no: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    reset: string;
    monthly: string;
    yearly: string;
    month: string;
    year: string;
    store: string;
    stores: string;
    unlimited: string;
    maximum: string;
  };
  navigation: {
    dashboard: string;
    userManagement: string;
    analytics: string;
    settings: string;
    stores: string;
    staff: string;
    reports: string;
    products: string;
    categories: string;
    stock: string;
    pos: string;
    transactions: string;
    customers: string;
    trialManagement: string;
    manualActivation: string;
    auditLogs: string;
    invoiceManagement: string;
  };
  roles: {
    superadmin: string;
    admin: string;
    warehouse: string;
    kasir: string;
  };
  auth: {
    signIn: string;
    signOut: string;
    email: string;
    password: string;
    forgotPassword: string;
    rememberMe: string;
    loginTitle: string;
    loginSubtitle: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    loginError: string;
    noAccess: string;
    orderNow: string;
  };
  nav: {
    features: string;
    pricing: string;
    testimonials: string;
    faq: string;
    cta: string;
    signin: string;
  };
  landing: {
    hero: {
      badge: string;
      title: string;
      subtitle: string;
      cta_trial: string;
      cta_demo: string;
      dashboard_alt: string;
    };
    features: {
      label: string;
      title: string;
      subtitle: string;
      items: Array<{ icon: string; title: string; desc: string }>;
    };
    testimonials: {
      label: string;
      title: string;
      subtitle: string;
      items: Array<{ quote: string; name: string; shop: string; city: string }>;
    };
    pricing: {
      label: string;
      title: string;
      subtitle: string;
      monthly: string;
      yearly: string;
      save: string;
      popular: string;
      plans: Array<{
        id: string;
        name: string;
        price: string;
        period: string;
        popular?: boolean;
        features: string[];
      }>;
      cta: string;
      contact: string;
    };
    showcase: {
      label: string;
      title: string;
      subtitle: string;
      items: Array<{ title: string; desc: string; alt: string }>;
    };
    faq: {
      title: string;
      subtitle: string;
      items: Array<{ q: string; a: string }>;
      support_text: string;
      support_link: string;
    };
    cta: {
      title: string;
      subtitle: string;
      cta_trial: string;
      cta_demo: string;
      trust: string;
    };
    heroTitle: string;
    heroSubtitle: string;
    getStarted: string;
    tryFree: string;
    viewDemo: string;
    about: string;
    featuresTitle: string;
    featuresSubtitle: string;
    multiStore: {
      title: string;
      description: string;
    };
    roleAccess: {
      title: string;
      description: string;
    };
    analytics: {
      title: string;
      description: string;
    };
    secure: {
      title: string;
      description: string;
    };
    performance: {
      title: string;
      description: string;
    };
    cloud: {
      title: string;
      description: string;
    };
    pricingTitle: string;
    pricingSubtitle: string;
    saveTwoMonths: string;
    mostPopular: string;
    selectPlan: string;
    ctaTitle: string;
    ctaSubtitle: string;
    startNowFree: string;
    footerDescription: string;
    product: string;
    support: string;
    company: string;
    allRightsReserved: string;
  };
  faq: {
    title: string;
    subtitle: string;
    questions: {
      q1: {
        question: string;
        answer: string;
      };
      q2: {
        question: string;
        answer: string;
      };
      q3: {
        question: string;
        answer: string;
      };
      q4: {
        question: string;
        answer: string;
      };
      q5: {
        question: string;
        answer: string;
      };
      q6: {
        question: string;
        answer: string;
      };
    };
  };
  pricing: {
    singleStore: {
      name: string;
      description: string;
      features: string[];
    };
    multiStore5: {
      name: string;
      description: string;
      features: string[];
    };
    multiStore20: {
      name: string;
      description: string;
      features: string[];
    };
    enterprise: {
      name: string;
      description: string;
      features: string[];
    };
  };
  footer: {
    brand_desc: string;
    product: string;
    product_links: {
      features: string;
      pricing: string;
      showcase: string;
      faq: string;
    };
    support: string;
    support_links: {
      help: string;
      contact: string;
      docs: string;
    };
    company: string;
    company_links: {
      about: string;
      blog: string;
      privacy: string;
      terms: string;
    };
    copyright: string;
  };
  legacyFooter: {
    product: {
      title: string;
      items: string[];
    };
    support: {
      title: string;
      items: string[];
    };
    company: {
      title: string;
      items: string[];
    };
  };
  order: {
    title: string;
    subtitle: string;
    selectPlan: string;
    orderInfo: string;
    orderDetails: string;
    orderDescription: string;
    fullName: string;
    fullNamePlaceholder: string;
    emailPlaceholder: string;
    companyName: string;
    companyPlaceholder: string;
    phoneNumber: string;
    phonePlaceholder: string;
    fullAddress: string;
    addressPlaceholder: string;
    additionalNotes: string;
    notesPlaceholder: string;
    orderSummary: string;
    package: string;
    period: string;
    discount: string;
    total: string;
    processing: string;
    continuePayment: string;
    orderSuccess: string;
    orderError: string;
    paymentSuccess: string;
    paymentSuccessDescription: string;
    paymentPending: string;
    paymentPendingDescription: string;
    paymentError: string;
    paymentErrorDescription: string;
    login: string;
  };
  register: {
    title: string;
    subtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    companyName: string;
    companyPlaceholder: string;
    phoneNumber: string;
    phonePlaceholder: string;
    address: string;
    addressPlaceholder: string;
    startTrial: string;
    processing: string;
    alreadyHaveAccount: string;
    trialInfo: string;
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordTooShort: string;
    passwordMismatch: string;
    companyRequired: string;
    phoneRequired: string;
    success: string;
    successDescription: string;
    checkEmail: string;
    emailExists: string;
    error: string;
    networkError: string;
  };
  verifyEmail: {
    title: string;
    subtitle: string;
    verified: string;
    verificationFailed: string;
    verifying: string;
    verifyingDescription: string;
    successDescription: string;
    errorDescription: string;
    sentTo: string;
    checkInbox: string;
    resendEmail: string;
    resending: string;
    resendIn: string;
    resendSuccess: string;
    resendError: string;
    emailRequired: string;
    emailNotFound: string;
    tooManyRequests: string;
    invalidToken: string;
    tokenNotFound: string;
    error: string;
    networkError: string;
    success: string;
    canNowLogin: string;
    redirecting: string;
    goToLogin: string;
    backToRegister: string;
    helpText: string;
  };
  orders: {
    title: string;
    subtitle: string;
    refresh: string;
    export: string;
    filters: string;
    search: string;
    searchPlaceholder: string;
    status: string;
    planType: string;
    fromDate: string;
    toDate: string;
    allStatus: string;
    allPlans: string;
    pending: string;
    paid: string;
    failed: string;
    expired: string;
    orderId: string;
    customer: string;
    plan: string;
    amount: string;
    tenant: string;
    created: string;
    actions: string;
    created_: string;
    notCreated: string;
    orderDetails: string;
    orderInfo: string;
    customerInfo: string;
    paymentInfo: string;
    statusHistory: string;
    gateway: string;
    method: string;
    transactionId: string;
    name: string;
    company: string;
    address: string;
    notes: string;
    changedBy: string;
    oldStatus: string;
    newStatus: string;
    changeNotes: string;
    updateStatus: string;
    createTenant: string;
    createTenantConfirm: string;
    createTenantDescription: string;
    tenantCreated: string;
    tenantCreationFailed: string;
    statusUpdated: string;
    statusUpdateFailed: string;
    fetchError: string;
    networkError: string;
    showing: string;
    to: string;
    of: string;
    previous: string;
    next: string;
    noData: string;
    loadingOrders: string;
    loadingDetails: string;
  };
  dashboard: {
    welcome: string;
    overview: string;
    statistics: string;
    recentActivity: string;
    quickActions: string;
    viewAll: string;
    noData: string;
    loading: string;
    error: string;
    refresh: string;
  };
  superadminDashboard: {
    title: string;
    subtitle: string;
    totalUsers: string;
    totalStores: string;
    totalRevenue: string;
    pendingOrders: string;
    recentOrders: string;
    orderFrom: string;
    approve: string;
    reject: string;
    viewDetails: string;
    noOrders: string;
    users: string;
    stores: string;
    revenue: string;
    orders: string;
    recentUsers: string;
    usersDescription: string;
    noUsers: string;
    ordersDescription: string;
    active: string;
    inactive: string;
  };
  adminDashboard: {
    title: string;
    subtitle: string;
    totalStores: string;
    totalStaff: string;
    totalProducts: string;
    monthlyRevenue: string;
    recentActivity: string;
    quickActions: string;
    manageStores: string;
    manageStaff: string;
    viewReports: string;
    addProduct: string;
    stores: string;
    staff: string;
    products: string;
    revenue: string;
    addStore: string;
    yourStores: string;
    storeListDescription: string;
    noStores: string;
    addFirstStore: string;
    created: string;
    active: string;
    inactive: string;
    manage: string;
    latestStaff: string;
    newStaffDescription: string;
    noStaff: string;
    inviteStaff: string;
    joined: string;
    warehouse: string;
    cashier: string;
  };
  settings: {
    title: string;
    settingsTitle: string;
    globalSettings: string;
    tenantSettings: string;
    globalDescription: string;
    tenantDescription: string;
    forceRefresh: string;
    tenantId: string;
    application: string;
    email: string;
    security: string;
    backup: string;
    system: string;
    applicationDescription: string;
    emailDescription: string;
    securityDescription: string;
    backupDescription: string;
    systemDescription: string;
    storeBrandingDescription: string;
    businessOperationsDescription: string;
    receiptSettingsDescription: string;
    notificationSettingsDescription: string;
    saving: string;
    saveSettings: string;
    settingsSaved: string;
    settingsError: string;
    noSettings: string;
    debugInfo: string;
    category: string;
    totalSettings: string;
    userRole: string;
    availableCategories: string;
    maintenanceMode: string;
    maintenanceWarning: string;
    previewReceipt: string;
    tenantIsolation: string;
    tenantIsolationInfo: string;

    emailNotificationsEnabled: string;
    emailNotificationsDescription: string;
    whatsappNotifications: string;
    whatsappNotificationsEnabled: string;
    whatsappNotificationsDescription: string;
    fonntteApiToken: string;
    fonntteApiTokenPlaceholder: string;
    fonntteApiTokenDescription: string;
    whatsappAdminNumber: string;
    whatsappAdminNumberPlaceholder: string;
    whatsappAdminNumberDescription: string;
    countryCode: string;
    selectCountryCode: string;
    indonesia: string;
    unitedStates: string;
    unitedKingdom: string;
    singapore: string;
    malaysia: string;
    testMode: string;
    testModeDescription: string;
    testing: string;
    testWhatsapp: string;
    whatsappTestSuccess: string;
    whatsappTestFailed: string;
    whatsappTestError: string;
    validationError: string;

    date: string;
    receiptNumber: string;
    subtotal: string;
    tax: string;
    total: string;
    scanForReview: string;
    validation: {
      apiTokenRequired: string;
      apiTokenTooShort: string;
      whatsappNumberRequired: string;
      whatsappNumberInvalid: string;
    };
    whatsapp: {
      fixValidationErrors: string;
      testSuccess: string;
      testFailed: string;
      testError: string;
    };
    storeBranding: {
      storeName: string;
      storeAddress: string;
      storePhone: string;
      storeEmail: string;
      storeLogoUrl: string;
      receiptFooterText: string;
      receiptThankYouMessage: string;
      defaultStoreName: string;
      defaultStoreAddress: string;
      defaultStorePhone: string;
      defaultStoreEmail: string;
      defaultReceiptFooter: string;
      defaultThankYouMessage: string;
      storeNamePlaceholder: string;
      storeAddressPlaceholder: string;
      storePhonePlaceholder: string;
      storeEmailPlaceholder: string;
      storeLogoUrlPlaceholder: string;
      receiptFooterPlaceholder: string;
      thankYouMessagePlaceholder: string;
    };
    businessOperations: {
      defaultTaxRate: string;
      currencySymbol: string;
      receiptPrintCopies: string;
      autoPrintReceipt: string;
      autoPrintReceiptDescription: string;
      loyaltyProgramEnabled: string;
      loyaltyProgramDescription: string;
      minimumStockAlert: string;
    };
    receiptSettings: {
      receiptWidth: string;
      selectPaperWidth: string;
      thermal58mm: string;
      thermal80mm: string;
      showBarcodeOnReceipt: string;
      showBarcodeDescription: string;
      receiptLanguage: string;
      selectReceiptLanguage: string;
      indonesian: string;
      english: string;
      includeCustomerInfo: string;
      includeCustomerInfoDescription: string;
      receiptQrCodeEnabled: string;
      qrCodeDescription: string;
    };
    notificationSettings: {
      lowStockNotifications: string;
      lowStockDescription: string;
      dailySalesReport: string;
      dailySalesDescription: string;
    };
  };
  analytics: {
    title: string;
    subtitle: string;
    selectPeriod: string;
    last3Months: string;
    last6Months: string;
    lastYear: string;
    export: string;
    totalRevenue: string;
    totalUsers: string;
    totalStores: string;
    totalOrders: string;
    fromLastMonth: string;
    activeStores: string;
    allTimeOrders: string;
    userGrowth: string;
    userGrowthDescription: string;
    newUsers: string;
    revenueTrends: string;
    revenueTrendsDescription: string;
    revenue: string;
    orders: string;
    roleDistribution: string;
    roleDistributionDescription: string;
    storePerformance: string;
    storePerformanceDescription: string;
    errorLoading: string;
    errorLoadingDescription: string;
    tryAgain: string;
  };
  userManagement: {
    title: string;
    subtitle: string;
    addNewUser: string;
    totalUsers: string;
    activeUsers: string;
    pendingApproval: string;
    suspended: string;
    allUsers: string;
    activeUsersDescription: string;
    pendingDescription: string;
    suspendedDescription: string;
    filterSearch: string;
    filterSearchDescription: string;
    searchPlaceholder: string;
    filterRole: string;
    filterStatus: string;
    allRoles: string;
    allStatus: string;
    active: string;
    pending: string;
    userList: string;
    usersCount: string;
    noUsersFound: string;
    joinedOn: string;
    approve: string;
    reject: string;
    suspend: string;
    activate: string;
    editUser: string;
    deleteUser: string;
    addUserTitle: string;
    addUserDescription: string;
    editUserTitle: string;
    editUserDescription: string;
    fullName: string;
    fullNamePlaceholder: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    selectRole: string;
    selectStatus: string;
    inactive: string;
    creating: string;
    createUser: string;
    updating: string;
    updateUser: string;
    deleteConfirmTitle: string;
    deleteConfirmDescription: string;
    deleting: string;
    userApproved: string;
    userApprovedDescription: string;
    userRejected: string;
    userRejectedDescription: string;
    userSuspended: string;
    userSuspendedDescription: string;
    userActivated: string;
    userActivatedDescription: string;
    userAdded: string;
    userAddedDescription: string;
    userUpdated: string;
    userUpdatedDescription: string;
    userDeleted: string;
    userDeletedDescription: string;
    approveError: string;
    rejectError: string;
    suspendError: string;
    activateError: string;
    addError: string;
    updateError: string;
    deleteError: string;
    accessDenied: string;
    accessDeniedDescription: string;
    authFailed: string;
    authFailedDescription: string;
    sessionExpired: string;
    sessionExpiredDescription: string;
    emailExists: string;
    emailExistsDescription: string;
    unknownError: string;
    noValidSession: string;
    failedToCreateUser: string;
  };
  products: {
    errorFetchingCategories: string;
    errorFetchingProducts: string;
    validation: {
      nameRequired: string;
      nameMinLength: string;
      skuRequired: string;
      skuMinLength: string;
      categoryRequired: string;
      priceRequired: string;
      minimumStockRequired: string;
      skuExists: string;
    };
    productUpdated: string;
    productAdded: string;
  };
  staff: {
    title: string;
    subtitle: string;
    inviteStaff: string;
    editStaff: string;
    deleteStaff: string;
    staffManagement: string;
    totalStaff: string;
    activeStaff: string;
    pendingInvites: string;
    warehouseStaff: string;
    kasirStaff: string;
    searchPlaceholder: string;
    allRoles: string;
    allStatus: string;
    allBranches: string;
    noStaffFound: string;
    lastLogin: string;
    invitation: string;
    password: string;
    actions: string;
    editStaffAction: string;
    managePermissions: string;
    resendInvitation: string;
    copyPassword: string;
    viewActivity: string;
    activate: string;
    deactivate: string;
    deleteStaffAction: string;
    inviteNewStaff: string;
    addStaffMemberDescription: string;
    staffName: string;
    email: string;
    role: string;
    branch: string;
    permissions: string;
    passwordSetup: string;
    sendWelcomeEmail: string;
    generatePassword: string;
    manualPassword: string;
    invitationEmail: string;
    customPassword: string;
    showPassword: string;
    hidePassword: string;
    passwordStrength: string;
    inviteStaffButton: string;
    cancel: string;
    updateStaff: string;
    staffAdded: string;
    staffUpdated: string;
    staffDeleted: string;
    invitationSent: string;
    invitationResent: string;
    passwordCopied: string;
    failedToAddStaff: string;
    failedToUpdateStaff: string;
    failedToDeleteStaff: string;
    failedToLoadStaffData: string;
    passwordOptions: {
      generate: {
        label: string;
        description: string;
      };
      manual: {
        label: string;
        description: string;
      };
      invitation: {
        label: string;
        description: string;
      };
    };
    roles: {
      admin: string;
      kasir: string;
      warehouse: string;
    };
    status: {
      active: string;
      inactive: string;
      pending: string;
    };
    invitationStatus: {
      sent: string;
      accepted: string;
      expired: string;
      resent: string;
    };
    passwordStatus: {
      temporary: string;
      permanent: string;
      notSet: string;
    };
    messages: {
      passwordEmpty: string;
      passwordEmptyDescription: string;
      passwordWeak: string;
      passwordWeakDescription: string;
      staffActivated: string;
      staffDeactivated: string;
      staffStatusChanged: string;
      mustChange: string;
      expired: string;
      copy: string;
    };
  };
  stock: {
    errorFetchingProducts: string;
    errorFetchingStores: string;
    errorFetchingMovements: string;
  };
  stores: {
    errorLoadingData: string;
    title: string;
    subtitle: string;
    addStore: string;
    editStore: string;
    deleteStore: string;
    storeManagement: string;
    totalStores: string;
    totalStaff: string;
    monthlyRevenue: string;
    averagePerStore: string;
    active: string;
    fromLastMonth: string;
    averagePerStoreRevenue: string;
    revenuePerBranch: string;
    storeList: string;
    storeListDescription: string;
    storeName: string;
    location: string;
    manager: string;
    staff: string;
    status: string;
    monthlyRevenueLabel: string;
    actions: string;
    edit: string;
    assignStaff: string;
    delete: string;
    addNewStore: string;
    updateStoreInfo: string;
    addNewBranch: string;
    address: string;
    city: string;
    phone: string;
    optional: string;
    cancel: string;
    update: string;
    add: string;
    assignStaffToStore: string;
    selectStaffToAssign: string;
    availableStaff: string;
    noAvailableStaff: string;
    selectedStaff: string;
    currentlyAt: string;
    assignStaffCount: string;
    storeUpdated: string;
    storeAdded: string;
    storeDeleted: string;
    staffAssigned: string;
    staffAssignedDescription: string;
    failedToSaveStore: string;
    failedToDeleteStore: string;
    errorLoadingStoresData: string;
    tryAgain: string;
    statusLabels: {
      active: string;
      inactive: string;
      maintenance: string;
    };
  };
  categories: {
    errorFetchingCategories: string;
    errorFetchingProducts: string;
  };
  customers: {
    errorFetchingCustomers: string;
    errorFetchingTransactions: string;
  };
  reports: {
    title: string;
    subtitle: string;
    exportExcel: string;
    exportPDF: string;
    filterReport: string;
    startDate: string;
    endDate: string;
    category: string;
    reportType: string;
    allCategories: string;
    stockSummary: string;
    movementDetail: string;
    categoryAnalysis: string;
    totalProducts: string;
    lowStock: string;
    inventoryValue: string;
    movements: string;
    productsRegistered: string;
    needRefill: string;
    totalStockValue: string;
    inThisPeriod: string;
    stockIn: string;
    stockOut: string;
    totalUnitsIn: string;
    totalUnitsOut: string;
    categoryBreakdown: string;
    products: string;
    totalStock: string;
    value: string;
    movement: string;
    stockSummaryPerProduct: string;
    stockSummaryDescription: string;
    noDataForPeriod: string;
    product: string;
    currentStock: string;
    minStock: string;
    totalIn: string;
    totalOut: string;
    totalMovements: string;
    lastMovement: string;
    status: string;
    normal: string;
    running_low: string;
    stockMovementDetail: string;
    stockMovementDescription: string;
    noMovementInPeriod: string;
    date: string;
    type: string;
    quantity: string;
    notes: string;
    by: string;
    in: string;
    out: string;
    transfer: string;
    adjustment: string;
    excelDownloaded: string;
    pdfDownloaded: string;
    categoryLabels: {
      device: string;
      liquid: string;
      peripheral: string;
      service: string;
    };
  };
  auditLog: {
    title: string;
    description: string;
    action: string;
    entity: string;
    user: string;
    details: string;
    time: string;
    view: string;
    noData: string;
    filters: {
      search: string;
      actionType: string;
      entity: string;
      all: string;
      startDate: string;
      endDate: string;
      perPage: string;
      moreFilters: string;
      reset: string;
    };
    tabs: {
      changes: string;
      rawData: string;
    };
    labels: {
      before: string;
      after: string;
      newData: string;
      deletedData: string;
      noChanges: string;
      noData: string;
    };
    stats: {
      totalLogs: string;
      today: string;
      last24Hours: string;
      last7Days: string;
    };
    realtime: {
      active: string;
      offline: string;
    };
    export: {
      csv: string;
    };
  };
}

export const translations: Record<'id' | 'en', TranslationData> = {
  id: {
    common: {
      dashboard: 'Dashboard',
      settings: 'Pengaturan',
      logout: 'Keluar',
      profile: 'Profil',
      save: 'Simpan',
      cancel: 'Batal',
      delete: 'Hapus',
      edit: 'Edit',
      add: 'Tambah',
      search: 'Cari',
      filter: 'Filter',
      loading: 'Memuat...',
      error: 'Error',
      success: 'Berhasil',
      warning: 'Peringatan',
      info: 'Info',
      yes: 'Ya',
      no: 'Tidak',
      close: 'Tutup',
      back: 'Kembali',
      next: 'Selanjutnya',
      previous: 'Sebelumnya',
      submit: 'Kirim',
      reset: 'Reset',
      monthly: 'Bulanan',
      yearly: 'Tahunan',
      month: 'bulan',
      year: 'tahun',
      store: 'toko',
      stores: 'toko',
      unlimited: 'Unlimited',
      maximum: 'Maksimal',
    },
    navigation: {
      dashboard: 'Dashboard',
      userManagement: 'Manajemen User',
      analytics: 'Analytics',
      settings: 'Pengaturan',
      stores: 'Toko',
      staff: 'Staff',
      reports: 'Laporan',
      products: 'Produk',
      categories: 'Kategori',
      stock: 'Stok',
      pos: 'POS',
      transactions: 'Transaksi',
      customers: 'Pelanggan',
      trialManagement: 'Trial Management',
      manualActivation: 'Manual Activation',
      auditLogs: 'Audit Logs',
      invoiceManagement: 'Invoice Management',
    },
    roles: {
      superadmin: 'Super Admin',
      admin: 'Admin',
      warehouse: 'Warehouse',
      kasir: 'Kasir',
    },
    auth: {
      signIn: 'Masuk',
      signOut: 'Keluar',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Lupa Password?',
      rememberMe: 'Ingat Saya',
      loginTitle: 'Masuk ke Akun Anda',
      loginSubtitle: 'Masukkan email dan password untuk mengakses dashboard',
      emailPlaceholder: 'nama@email.com',
      passwordPlaceholder: 'Masukkan password',
      loginError: 'Terjadi kesalahan saat login',
      noAccess: 'Belum punya akses?',
      orderNow: 'Pesan sekarang',
    },
    nav: {
      features: 'Fitur',
      pricing: 'Harga',
      testimonials: 'Testimoni',
      faq: 'FAQ',
      cta: 'Coba Gratis',
      signin: 'Masuk',
    },
    landing: {
      hero: {
        badge: '🇮🇩 Solusi POS #1 untuk Vape Shop',
        title: 'Kelola Vape Shop Lebih Mudah & Profesional',
        subtitle:
          'Catat liquid, transaksi, dan laporan bisnis dalam satu dashboard. Dibuat khusus untuk pemilik vape shop di Indonesia.',
        cta_trial: 'Coba Gratis 14 Hari',
        cta_demo: 'Lihat Demo',
        dashboard_alt: 'Tampilan dashboard VaporPOS',
      },
      features: {
        label: 'FITUR UNGGULAN',
        title: 'Semua yang Kamu Butuhkan untuk Vape Shop',
        subtitle:
          'Dari manajemen stok liquid sampai laporan keuangan, semua lengkap di VaporPOS.',
        items: [
          {
            icon: 'Store',
            title: 'Multi-Store',
            desc:
              'Kelola banyak cabang toko dari satu akun. Pantau stok dan penjualan tiap cabang secara real-time.',
          },
          {
            icon: 'Package',
            title: 'Katalog Produk',
            desc:
              'Atur device, liquid, peripheral, dan jasa rekondisi. Kategorisasi rapi dengan foto & harga.',
          },
          {
            icon: 'Users',
            title: 'Role-Based Access',
            desc:
              'Superadmin, admin, warehouse, kasir — setiap role punya akses sesuai tugasnya.',
          },
          {
            icon: 'BarChart3',
            title: 'Laporan & Analitik',
            desc:
              'Laporan penjualan harian, mingguan, bulanan. Pantau produk terlaris dan margin keuntungan.',
          },
          {
            icon: 'Shield',
            title: 'Keamanan Data',
            desc:
              'Data transaksi dan pelanggan aman dengan enkripsi. Backup otomatis ke cloud.',
          },
          {
            icon: 'Cloud',
            title: 'Cloud-Based',
            desc:
              'Akses dari mana saja — laptop, tablet, atau HP. Tidak perlu install server.',
          },
        ],
      },
      testimonials: {
        label: 'TESTIMONIAL',
        title: 'Dipercaya Ratusan Vape Shop di Indonesia',
        subtitle:
          'Dengerin langsung cerita dari pemilik vape shop yang udah pake VaporPOS.',
        items: [
          {
            quote:
              'Sebelum pakai VaporPOS, stok liquid suka selisih. Sekarang semua tercatat rapi, laporan juga tinggal klik. Recommended banget!',
            name: 'Andi Pratama',
            shop: 'AndiVape Store',
            city: 'Jakarta',
          },
          {
            quote:
              'Fitur multi-store-nya juara. Saya punya 3 cabang dan semuanya bisa dipantau dari satu dashboard. Ga perlu bolak-balik toko lagi.',
            name: 'Rina Susanti',
            shop: 'Cloud9 Vapor',
            city: 'Bandung',
          },
          {
            quote:
              'Support-nya fast response. Pas awal pindah dari catatan manual, tim VaporPOS bantu migrasi data sampai beres. Top!',
            name: 'Budi Hartono',
            shop: 'VapeKing',
            city: 'Surabaya',
          },
        ],
      },
      pricing: {
        label: 'HARGA',
        title: 'Paket Harga yang Fleksibel',
        subtitle:
          'Mulai dari toko kecil sampai jaringan menengah, ada paket yang pas buat kamu.',
        monthly: 'Bulanan',
        yearly: 'Tahunan',
        save: 'Hemat 17%',
        popular: 'POPULER',
        plans: [
          {
            id: 'single',
            name: 'Toko Satuan',
            price: '50K',
            period: '/bln',
            features: [
              '1 toko',
              '5 user akses',
              'Produk tak terbatas',
              'Laporan dasar',
              'Support email',
              'Cloud backup',
            ],
          },
          {
            id: 'multi5',
            name: 'Multi Store 5',
            price: '150K',
            period: '/bln',
            popular: true,
            features: [
              '5 toko',
              '15 user akses',
              'Produk tak terbatas',
              'Laporan lanjutan',
              'Multi-store dashboard',
              'Support prioritas',
              'Export data',
              'Cloud backup',
            ],
          },
          {
            id: 'multi20',
            name: 'Multi Store 20',
            price: '250K',
            period: '/bln',
            features: [
              '20 toko',
              '50 user akses',
              'Produk tak terbatas',
              'Laporan advance',
              'Analitik custom',
              'Support prioritas 24/7',
              'Export data',
              'Cloud backup',
            ],
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            features: [
              '>20 toko',
              'User tak terbatas',
              'Produk tak terbatas',
              'Dedicated support',
              'Custom integrasi',
              'On-premise option',
              'SLA guarantee',
              'Priority feature request',
            ],
          },
        ],
        cta: 'Pilih Paket',
        contact: 'Hubungi Kami',
      },
      showcase: {
        label: 'TAMPILAN APLIKASI',
        title: 'Dashboard yang Bersih & Mudah Digunakan',
        subtitle:
          'Antarmuka modern yang bikin operasional toko jadi lebih efisien.',
        items: [
          {
            title: 'Dashboard Ringkasan',
            desc:
              'Pantau penjualan, stok, dan performa toko dalam satu layar. Grafik interaktif dan real-time update.',
            alt: 'Dashboard ringkasan VaporPOS',
          },
          {
            title: 'Manajemen Stok',
            desc:
              'Kelola ratusan SKU liquid, device, dan peripheral dengan mudah. Notifikasi stok menipis otomatis.',
            alt: 'Manajemen stok VaporPOS',
          },
          {
            title: 'Point of Sale',
            desc:
              'Transaksi cepat dengan interface yang intuitif. Dukung berbagai metode pembayaran dan cetak struk.',
            alt: 'Point of sale VaporPOS',
          },
        ],
      },
      faq: {
        title: 'Pertanyaan yang Sering Diajukan',
        subtitle: 'Ada pertanyaan? Cek dulu di sini.',
        items: [
          {
            q: 'Apa itu VaporPOS?',
            a: 'VaporPOS adalah aplikasi Point of Sale (POS) berbasis cloud yang dirancang khusus untuk toko vape di Indonesia. Mulai dari pencatatan penjualan, manajemen stok liquid dan device, sampai laporan keuangan — semua dalam satu aplikasi.',
          },
          {
            q: 'Apakah bisa untuk banyak cabang?',
            a: 'Bisa banget! VaporPOS mendukung multi-store. Pantau stok, penjualan, dan performa setiap cabang dari satu dashboard.',
          },
          {
            q: 'Seberapa aman data saya?',
            a: 'Keamanan data adalah prioritas kami. Semua data dienkripsi, disimpan di server cloud yang aman, dan di-backup secara otomatis.',
          },
          {
            q: 'Apa ada free trial?',
            a: 'Ada! Kamu bisa coba VaporPOS gratis selama 14 hari. No credit card required — daftar langsung pakai.',
          },
          {
            q: 'Gimana kalau saya butuh bantuan?',
            a: 'Tim support kami siap bantu via WhatsApp, email, atau chat langsung dari dashboard. Response time rata-rata di bawah 1 jam.',
          },
          {
            q: 'Apakah bisa integrasi dengan alat lain?',
            a: 'Saat ini VaporPOS sudah mendukung Midtrans untuk pembayaran digital dan Fonnte untuk WhatsApp notification. Integrasi lain coming soon!',
          },
        ],
        support_text: 'Masih ada pertanyaan?',
        support_link: 'Hubungi Support',
      },
      cta: {
        title: 'Siap Bawa Vape Shop Kamu ke Level Berikutnya?',
        subtitle:
          'Daftar sekarang dan nikmati 14 hari gratis. No credit card, batal kapan aja.',
        cta_trial: 'Mulai Gratis 14 Hari',
        cta_demo: 'Jadwalkan Demo',
        trust: 'Tanpa kartu kredit • 14 hari gratis • Batal kapan aja',
      },
      heroTitle: 'Sistem POS Terdepan untuk Bisnis Vapor',
      heroSubtitle:
        'Kelola toko vapor Anda dengan mudah. Dari device, liquid, peripheral hingga jasa recoil - semua dalam satu platform yang powerful dan user-friendly.',
      getStarted: 'Mulai Sekarang',
      tryFree: 'Coba Gratis 14 Hari',
      viewDemo: 'Lihat Demo',
      about: 'Tentang',
      featuresTitle: 'Fitur Lengkap untuk Bisnis Vapor',
      featuresSubtitle:
        'Semua yang Anda butuhkan untuk mengelola bisnis vapor modern',
      multiStore: {
        title: 'Multi-Store Management',
        description:
          'Kelola multiple cabang toko vapor dari satu dashboard terpusat',
      },
      roleAccess: {
        title: 'Role-Based Access',
        description: 'Sistem role lengkap: Admin, Warehouse, dan Kasir',
      },
      analytics: {
        title: 'Analytics & Reporting',
        description:
          'Laporan penjualan real-time dengan grafik dan insights mendalam',
      },
      secure: {
        title: 'Secure & Reliable',
        description: 'Keamanan tingkat enterprise dengan backup otomatis',
      },
      performance: {
        title: 'Fast Performance',
        description:
          'Interface yang cepat dan responsif untuk transaksi harian',
      },
      cloud: {
        title: 'Cloud-Based',
        description:
          'Akses dari mana saja, kapan saja dengan sinkronisasi real-time',
      },
      pricingTitle: 'Pilih Paket yang Tepat',
      pricingSubtitle: 'Hemat hingga 2 bulan dengan paket tahunan',
      saveTwoMonths: 'Hemat 2 bulan',
      mostPopular: 'Paling Populer',
      selectPlan: 'Pilih Paket',
      ctaTitle: 'Siap Mengembangkan Bisnis Vapor Anda?',
      ctaSubtitle:
        'Bergabung dengan ribuan pemilik toko vapor yang sudah mempercayai VaporPos',
      startNowFree: 'Mulai Sekarang - Gratis 14 Hari',
      footerDescription: 'Sistem POS terdepan untuk bisnis vapor di Indonesia',
      product: 'Produk',
      support: 'Support',
      company: 'Company',
      allRightsReserved: 'All rights reserved',
    },
    faq: {
      title: 'Pertanyaan yang Sering Diajukan',
      subtitle: 'Temukan jawaban untuk pertanyaan umum tentang VaporPos',
      questions: {
        q1: {
          question: 'Apa itu VaporPos dan bagaimana cara kerjanya?',
          answer: 'VaporPos adalah sistem Point of Sale (POS) yang dirancang khusus untuk bisnis vapor dan vape shop. Sistem ini membantu Anda mengelola inventory, penjualan, pelanggan, dan laporan bisnis dalam satu platform yang terintegrasi. Anda dapat mengakses sistem dari mana saja melalui cloud-based platform kami.'
        },
        q2: {
          question: 'Apakah VaporPos mendukung multiple toko?',
          answer: 'Ya, VaporPos mendukung multi-store management. Anda dapat mengelola hingga 5, 20, atau unlimited cabang toko tergantung paket yang dipilih. Semua data akan tersinkronisasi secara real-time antar cabang.'
        },
        q3: {
          question: 'Bagaimana sistem keamanan data di VaporPos?',
          answer: 'Kami menggunakan enkripsi tingkat enterprise dan backup otomatis untuk menjaga keamanan data Anda. Semua data disimpan di cloud server yang aman dengan sertifikasi keamanan internasional. Akses data juga dilindungi dengan sistem role-based access control.'
        },
        q4: {
          question: 'Apakah ada trial gratis yang tersedia?',
          answer: 'Ya, kami menyediakan trial gratis selama 14 hari untuk semua paket. Anda dapat mencoba semua fitur tanpa perlu memberikan informasi kartu kredit. Setelah trial berakhir, Anda dapat memilih paket yang sesuai dengan kebutuhan bisnis Anda.'
        },
        q5: {
          question: 'Bagaimana cara mendapatkan support teknis?',
          answer: 'Kami menyediakan support 24/7 melalui berbagai channel: live chat, email, dan WhatsApp. Tim support kami terdiri dari ahli yang berpengalaman dalam industri vapor dan sistem POS. Kami juga menyediakan dokumentasi lengkap dan video tutorial.'
        },
        q6: {
          question: 'Bisakah VaporPos terintegrasi dengan sistem lain?',
          answer: 'Belum, kami masih mengembangkan untuk integrasi dengan sistem lain yang menunjang kebutuhan dengan sistem bisnis Anda.'
        }
      }
    },
    pricing: {
      singleStore: {
        name: 'Single Store',
        description: 'Perfect untuk satu toko vapor',
        features: [
          'Dashboard POS lengkap',
          'Management inventory',
          'Laporan penjualan',
          'Multi-user (Admin, Warehouse, Kasir)',
          'Support 24/7',
        ],
      },
      multiStore5: {
        name: 'Multi Store (5)',
        description: 'Untuk bisnis dengan maksimal 5 cabang',
        features: [
          'Semua fitur Single Store',
          'Multi-store management',
          'Analytics antar cabang',
          'Staff assignment',
          'Inventory transfer',
          'Consolidated reporting',
        ],
      },
      multiStore20: {
        name: 'Multi Store (20)',
        description: 'Untuk bisnis dengan maksimal 20 cabang',
        features: [
          'Semua fitur Multi Store (5)',
          'Advanced analytics',
          'Custom reporting',
          'API access',
          'Priority support',
          'Training session',
        ],
      },
      enterprise: {
        name: 'Enterprise',
        description: 'Untuk bisnis dengan 20+ cabang',
        features: [
          'Semua fitur Multi Store (20)',
          'Unlimited stores',
          'Custom integrations',
          'Dedicated support',
          'On-premise option',
          'Custom development',
        ],
      },
    },
    footer: {
      brand_desc:
        'Solusi POS lengkap untuk vape shop di Indonesia. Kelola toko lebih mudah dengan VaporPOS.',
      product: 'Produk',
      product_links: {
        features: 'Fitur',
        pricing: 'Harga',
        showcase: 'Tampilan',
        faq: 'FAQ',
      },
      support: 'Bantuan',
      support_links: {
        help: 'Pusat Bantuan',
        contact: 'Kontak',
        docs: 'Dokumentasi',
      },
      company: 'Perusahaan',
      company_links: {
        about: 'Tentang',
        blog: 'Blog',
        privacy: 'Privasi',
        terms: 'Syarat',
      },
      copyright: '© {year} VaporPOS. All rights reserved.',
    },
    legacyFooter: {
      product: {
        title: 'Produk',
        items: [
          'POS System',
          'Inventory Management',
          'Analytics',
          'Multi-Store',
        ],
      },
      support: {
        title: 'Support',
        items: ['Help Center', 'Documentation', 'Contact Us', 'Training'],
      },
      company: {
        title: 'Company',
        items: ['About Us', 'Privacy Policy', 'Terms of Service', 'Blog'],
      },
    },
    order: {
      title: 'Pilih Paket VaporPos',
      subtitle: 'Mulai transformasi digital bisnis vapor Anda hari ini',
      selectPlan: 'Pilih Paket',
      orderInfo: 'Informasi Pemesanan',
      orderDetails: 'Detail Pemesanan',
      orderDescription: 'Isi informasi di bawah untuk melanjutkan pemesanan',
      fullName: 'Nama Lengkap *',
      fullNamePlaceholder: 'Masukkan nama lengkap',
      emailPlaceholder: 'nama@email.com',
      companyName: 'Nama Perusahaan/Toko *',
      companyPlaceholder: 'Nama toko vapor',
      phoneNumber: 'Nomor Telepon *',
      phonePlaceholder: '08xxxxxxxxxx',
      fullAddress: 'Alamat Lengkap *',
      addressPlaceholder: 'Alamat lengkap toko/kantor',
      additionalNotes: 'Catatan Tambahan',
      notesPlaceholder: 'Kebutuhan khusus atau pertanyaan',
      orderSummary: 'Ringkasan Pesanan',
      package: 'Paket:',
      period: 'Periode:',
      discount: 'Diskon:',
      total: 'Total:',
      processing: 'Memproses...',
      continuePayment: 'Lanjutkan ke Pembayaran',
      orderSuccess: 'Order berhasil dibuat! Tim kami akan menghubungi Anda segera.',
      orderError: 'Terjadi kesalahan. Silakan coba lagi.',
      paymentSuccess: 'Pembayaran berhasil! Akun tenant Anda akan segera dibuat.',
      paymentSuccessDescription: 'Terima kasih atas pembayaran Anda. Akun akan diaktifkan dalam beberapa menit.',
      paymentPending: 'Pembayaran sedang diproses. Silakan tunggu konfirmasi.',
      paymentPendingDescription: 'Pembayaran Anda sedang diverifikasi. Kami akan mengirim notifikasi setelah selesai.',
      paymentError: 'Pembayaran gagal. Silakan coba lagi.',
      paymentErrorDescription: 'Terjadi kesalahan saat memproses pembayaran. Silakan periksa detail pembayaran dan coba lagi.',
      login: 'Login',
    },
    register: {
      title: 'Daftar Trial Gratis',
      subtitle: 'Mulai trial 14 hari gratis VaporPos sekarang',
      fullName: 'Nama Lengkap',
      fullNamePlaceholder: 'Masukkan nama lengkap Anda',
      emailPlaceholder: 'Masukkan alamat email Anda',
      passwordPlaceholder: 'Masukkan password (min. 6 karakter)',
      confirmPassword: 'Konfirmasi Password',
      confirmPasswordPlaceholder: 'Masukkan ulang password Anda',
      companyName: 'Nama Perusahaan',
      companyPlaceholder: 'Masukkan nama perusahaan/toko vapor Anda',
      phoneNumber: 'Nomor Telepon',
      phonePlaceholder: 'Masukkan nomor telepon Anda',
      address: 'Alamat',
      addressPlaceholder: 'Masukkan alamat perusahaan/toko (opsional)',
      startTrial: 'Mulai Trial Gratis',
      processing: 'Memproses...',
      alreadyHaveAccount: 'Sudah punya akun?',
      trialInfo: '🎉 Trial gratis 14 hari tanpa perlu kartu kredit. Akses penuh ke semua fitur VaporPos!',
      nameRequired: 'Nama lengkap wajib diisi',
      emailRequired: 'Email wajib diisi',
      emailInvalid: 'Format email tidak valid',
      passwordRequired: 'Password wajib diisi',
      passwordTooShort: 'Password minimal 6 karakter',
      passwordMismatch: 'Konfirmasi password tidak cocok',
      companyRequired: 'Nama perusahaan wajib diisi',
      phoneRequired: 'Nomor telepon wajib diisi',
      success: 'Registrasi Berhasil!',
      successDescription: 'Silakan cek email Anda untuk verifikasi akun',
      checkEmail: 'Silakan cek email Anda untuk verifikasi',
      emailExists: 'Email sudah terdaftar',
      error: 'Gagal mendaftar',
      networkError: 'Koneksi bermasalah, silakan coba lagi',
    },
    verifyEmail: {
      title: 'Verifikasi Email',
      subtitle: 'Kami telah mengirim link verifikasi ke email Anda',
      verified: 'Email Terverifikasi!',
      verificationFailed: 'Verifikasi Gagal',
      verifying: 'Memverifikasi...',
      verifyingDescription: 'Sedang memverifikasi email Anda, mohon tunggu...',
      successDescription: 'Email Anda berhasil diverifikasi. Trial 14 hari telah dimulai!',
      errorDescription: 'Gagal memverifikasi email. Silakan coba kirim ulang link verifikasi.',
      sentTo: 'Email verifikasi dikirim ke:',
      checkInbox: 'Silakan cek inbox email Anda dan klik link verifikasi',
      resendEmail: 'Kirim Ulang Email',
      resending: 'Mengirim...',
      resendIn: 'Kirim ulang dalam',
      resendSuccess: 'Email verifikasi berhasil dikirim ulang',
      resendError: 'Gagal mengirim ulang email verifikasi',
      emailRequired: 'Email diperlukan',
      emailNotFound: 'Email tidak ditemukan',
      tooManyRequests: 'Terlalu banyak permintaan, coba lagi nanti',
      invalidToken: 'Token verifikasi tidak valid',
      tokenNotFound: 'Token verifikasi tidak ditemukan',
      error: 'Gagal memverifikasi email',
      networkError: 'Koneksi bermasalah, silakan coba lagi',
      success: 'Email berhasil diverifikasi',
      canNowLogin: 'Anda sekarang bisa masuk ke dashboard',
      redirecting: 'Mengalihkan ke halaman login dalam 3 detik...',
      goToLogin: 'Masuk ke Dashboard',
      backToRegister: 'Kembali ke Registrasi',
      helpText: 'Tidak menerima email? Cek folder spam atau kirim ulang email verifikasi.',
    },
    orders: {
      title: 'Manajemen Order',
      subtitle: 'Kelola order dan pembayaran pelanggan',
      refresh: 'Refresh',
      export: 'Export',
      filters: 'Filter',
      search: 'Cari',
      searchPlaceholder: 'Email, nama, perusahaan...',
      status: 'Status',
      planType: 'Tipe Paket',
      fromDate: 'Dari Tanggal',
      toDate: 'Sampai Tanggal',
      allStatus: 'Semua Status',
      allPlans: 'Semua Paket',
      pending: 'Pending',
      paid: 'Dibayar',
      failed: 'Gagal',
      expired: 'Kedaluwarsa',
      orderId: 'ID Order',
      customer: 'Pelanggan',
      plan: 'Paket',
      amount: 'Jumlah',
      tenant: 'Tenant',
      created: 'Dibuat',
      actions: 'Aksi',
      created_: 'Dibuat',
      notCreated: 'Belum Dibuat',
      orderDetails: 'Detail Order',
      orderInfo: 'Informasi Order',
      customerInfo: 'Informasi Pelanggan',
      paymentInfo: 'Informasi Pembayaran',
      statusHistory: 'Riwayat Status',
      gateway: 'Gateway',
      method: 'Metode',
      transactionId: 'ID Transaksi',
      name: 'Nama',
      company: 'Perusahaan',
      address: 'Alamat',
      notes: 'Catatan',
      changedBy: 'Diubah Oleh',
      oldStatus: 'Status Lama',
      newStatus: 'Status Baru',
      changeNotes: 'Catatan Perubahan',
      updateStatus: 'Update Status',
      createTenant: 'Buat Akun Tenant',
      createTenantConfirm: 'Buat Akun Tenant',
      createTenantDescription: 'Ini akan membuat akun tenant baru dan mengirim kredensial login.',
      tenantCreated: 'Akun tenant berhasil dibuat!',
      tenantCreationFailed: 'Gagal membuat akun tenant',
      statusUpdated: 'Status order berhasil diperbarui',
      statusUpdateFailed: 'Gagal memperbarui status order',
      fetchError: 'Gagal mengambil data order',
      networkError: 'Kesalahan jaringan. Periksa koneksi internet Anda.',
      showing: 'Menampilkan',
      to: 'sampai',
      of: 'dari',
      previous: 'Sebelumnya',
      next: 'Selanjutnya',
      noData: 'Tidak ada data order',
      loadingOrders: 'Memuat order...',
      loadingDetails: 'Memuat detail order...',
    },
    dashboard: {
      welcome: 'Selamat Datang',
      overview: 'Ringkasan',
      statistics: 'Statistik',
      recentActivity: 'Aktivitas Terbaru',
      quickActions: 'Aksi Cepat',
      viewAll: 'Lihat Semua',
      noData: 'Tidak ada data',
      loading: 'Memuat...',
      error: 'Terjadi kesalahan',
      refresh: 'Refresh',
    },
    superadminDashboard: {
      title: 'Dashboard Super Admin',
      subtitle: 'Kelola sistem global dan semua tenant',
      totalUsers: 'Total Pengguna',
      totalStores: 'Total Toko',
      totalRevenue: 'Total Pendapatan',
      pendingOrders: 'Pesanan Pending',
      recentOrders: 'Pesanan Terbaru',
      orderFrom: 'Pesanan dari',
      approve: 'Setujui',
      reject: 'Tolak',
      viewDetails: 'Lihat Detail',
      noOrders: 'Tidak ada pesanan pending',
      users: 'pengguna',
      stores: 'toko',
      revenue: 'pendapatan',
      orders: 'pesanan',
      recentUsers: 'Pengguna Terbaru',
      usersDescription: 'Pengguna yang baru mendaftar',
      noUsers: 'Tidak ada pengguna baru',
      ordersDescription: 'Pesanan yang menunggu persetujuan',
      active: 'Aktif',
      inactive: 'Nonaktif',
    },
    adminDashboard: {
      title: 'Dashboard Admin',
      subtitle: 'Kelola toko dan operasional bisnis Anda',
      totalStores: 'Total Stores',
      totalStaff: 'Total Staff',
      totalProducts: 'Total Products',
      monthlyRevenue: 'Monthly Revenue',
      recentActivity: 'Aktivitas Terbaru',
      quickActions: 'Aksi Cepat',
      manageStores: 'Kelola Toko',
      manageStaff: 'Kelola Staff',
      viewReports: 'Lihat Laporan',
      addProduct: 'Tambah Produk',
      stores: 'toko',
      staff: 'staff',
      products: 'produk',
      revenue: 'pendapatan',
      addStore: 'Tambah Toko',
      yourStores: 'Toko Anda',
      storeListDescription: 'Daftar toko yang Anda kelola',
      noStores: 'Belum ada toko',
      addFirstStore: 'Tambah Toko Pertama',
      created: 'Dibuat',
      active: 'Aktif',
      inactive: 'Nonaktif',
      manage: 'Kelola',
      latestStaff: 'Staff Terbaru',
      newStaffDescription: 'Staff yang baru bergabung',
      noStaff: 'Belum ada staff',
      inviteStaff: 'Undang Staff',
      joined: 'Bergabung',
      warehouse: 'Warehouse',
      cashier: 'Kasir',
    },
    settings: {
      title: 'Pengaturan',
      settingsTitle: 'Pengaturan',
      globalSettings: 'Pengaturan Global',
      tenantSettings: 'Pengaturan Tenant',
      globalDescription: 'Konfigurasi global sistem untuk semua tenant',
      tenantDescription: 'Konfigurasi sistem dan pengaturan aplikasi untuk tenant Anda',
      forceRefresh: 'Refresh Paksa',
      tenantId: 'Tenant ID',
      application: 'Aplikasi',
      email: 'Email',
      security: 'Keamanan',
      backup: 'Backup',
      system: 'Sistem',

      applicationDescription: 'Pengaturan umum aplikasi dan branding',
      emailDescription: 'Konfigurasi email dan pemberitahuan',
      securityDescription: 'Pola keamanan dan otentikasi',
      backupDescription: 'Pengaturan backup dan pemeliharaan',
      systemDescription: 'Prefersi sistem dan localisasi',
      storeBrandingDescription: 'Informasi toko dan branding untuk struk',
      businessOperationsDescription: 'Aturan bisnis, pajak, mata uang, dan pengaturan operasional',
      receiptSettingsDescription: 'Format struk, bahasa, dan preferensi cetak',
      notificationSettingsDescription: 'Pemberitahuan email, SMS, dan alert',
      saving: 'Menyimpan...',
      saveSettings: 'Simpan Pengaturan',
      settingsSaved: 'Pengaturan berhasil disimpan!',
      settingsError: 'Terjadi kesalahan saat menyimpan pengaturan. Silakan coba lagi.',
      noSettings: 'Tidak ada pengaturan yang tersedia untuk kategori ini',
      debugInfo: 'Info Debug:',
      category: 'Kategori:',
      totalSettings: 'Total pengaturan:',
      userRole: 'Role pengguna:',
      availableCategories: 'Kategori yang tersedia:',
      maintenanceMode: 'Mode pemeliharaan aktif',
      maintenanceWarning: 'Mode pemeliharaan aktif. Pengguna tidak dapat mengakses aplikasi.',
      previewReceipt: 'Preview Struk',
      tenantIsolation: 'Isolasi Tenant',
      tenantIsolationInfo: 'Settings ini terisolasi untuk tenant Anda dan tidak akan mempengaruhi tenant lain.',

      emailNotificationsEnabled: 'Notifikasi Email Aktif',
      emailNotificationsDescription: 'Aktifkan semua notifikasi email',
      whatsappNotifications: 'Pemberitahuan WhatsApp',
      whatsappNotificationsEnabled: 'Aktifkan Pemberitahuan WhatsApp',
      whatsappNotificationsDescription: 'Aktifkan notifikasi via WhatsApp menggunakan Fonnte API',
      fonntteApiToken: 'Fonnte API Token',
      fonntteApiTokenPlaceholder: 'Masukkan API token dari Fonnte',
      fonntteApiTokenDescription: 'Dapatkan API token dari Fonnte Dashboard',
      whatsappAdminNumber: 'WhatsApp Admin Number',
      whatsappAdminNumberPlaceholder: '628123456789',
      whatsappAdminNumberDescription: 'Format: 628123456789 (tanpa tanda + dan spasi)',
      countryCode: 'Kode Negara',
      selectCountryCode: 'Pilih kode negara',
      indonesia: '🇮🇩 Indonesia (+62)',
      unitedStates: '🇺🇸 United States (+1)',
      unitedKingdom: '🇬🇧 United Kingdom (+44)',
      singapore: '🇸🇬 Singapore (+65)',
      malaysia: '🇲🇾 Malaysia (+60)',
      testMode: 'Test Mode',
      testModeDescription: 'Mode testing (pesan tidak akan dikirim)',
      testing: 'Testing...',
      testWhatsapp: 'Test WhatsApp',
      whatsappTestSuccess: 'WhatsApp test berhasil! Pesan test telah dikirim.',
      whatsappTestFailed: 'WhatsApp test gagal:',
      whatsappTestError: 'Terjadi kesalahan saat testing WhatsApp',
      validationError: 'Mohon perbaiki error validasi terlebih dahulu',
      date: 'Date:',
      receiptNumber: 'Receipt #:',
      subtotal: 'Subtotal:',
      tax: 'Tax',
      total: 'Total:',
      scanForReview: 'Scan untuk review',
      validation: {
        apiTokenRequired: 'API Token wajib diisi jika WhatsApp notifications diaktifkan',
        apiTokenTooShort: 'API Token terlalu pendek',
        whatsappNumberRequired: 'Nomor WhatsApp admin wajib diisi',
        whatsappNumberInvalid: 'Format nomor WhatsApp tidak valid',
      },
      whatsapp: {
        fixValidationErrors: 'Mohon perbaiki error validasi terlebih dahulu',
        testSuccess: 'WhatsApp test berhasil! Pesan test telah dikirim.',
        testFailed: 'WhatsApp test gagal',
        testError: 'Terjadi kesalahan saat testing WhatsApp',
      },
      storeBranding: {
        storeName: 'Nama Toko',
        storeAddress: 'Alamat Toko',
        storePhone: 'Telepon Toko',
        storeEmail: 'Email Toko',
        storeLogoUrl: 'URL Logo Toko',
        receiptFooterText: 'Teks Footer Receipt',
        receiptThankYouMessage: 'Pesan Terima Kasih Receipt',
        defaultStoreName: 'Vapor Store',
        defaultStoreAddress: 'Jl. Contoh No. 123, Jakarta',
        defaultStorePhone: '+62 21 1234 5678',
        defaultStoreEmail: 'info@vaporstore.com',
        defaultReceiptFooter: 'Terima kasih atas kunjungan Anda!',
        defaultThankYouMessage: 'Selamat menikmati produk vapor Anda!',
        storeNamePlaceholder: 'Nama toko Anda',
        storeAddressPlaceholder: 'Alamat lengkap toko',
        storePhonePlaceholder: 'Nomor telepon toko',
        storeEmailPlaceholder: 'Email toko',
        storeLogoUrlPlaceholder: 'URL logo toko (opsional)',
        receiptFooterPlaceholder: 'Teks footer di receipt',
        thankYouMessagePlaceholder: 'Pesan terima kasih di receipt',
      },
      businessOperations: {
        defaultTaxRate: 'Tarif Pajak Default',
        currencySymbol: 'Simbol Mata Uang',
        receiptPrintCopies: 'Jumlah Cetak Receipt',
        autoPrintReceipt: 'Auto Print Receipt',
        autoPrintReceiptDescription: 'Otomatis cetak receipt setelah transaksi',
        loyaltyProgramEnabled: 'Program Loyalty Aktif',
        loyaltyProgramDescription: 'Aktifkan program loyalty customer',
        minimumStockAlert: 'Alert Stok Minimum',
      },
      receiptSettings: {
        receiptWidth: 'Lebar Receipt',
        selectPaperWidth: 'Pilih lebar kertas',
        thermal58mm: '58mm (Thermal kecil)',
        thermal80mm: '80mm (Thermal standar)',
        showBarcodeOnReceipt: 'Tampilkan Barcode di Receipt',
        showBarcodeDescription: 'Tampilkan barcode produk di receipt',
        receiptLanguage: 'Bahasa Receipt',
        selectReceiptLanguage: 'Pilih bahasa receipt',
        indonesian: 'Bahasa Indonesia',
        english: 'English',
        includeCustomerInfo: 'Sertakan Info Customer',
        includeCustomerInfoDescription: 'Sertakan info customer di receipt',
        receiptQrCodeEnabled: 'QR Code Receipt Aktif',
        qrCodeDescription: 'QR code untuk feedback/review',
      },
      notificationSettings: {
        lowStockNotifications: 'Notifikasi Stok Rendah',
        lowStockDescription: 'Notifikasi saat stok produk menipis',
        dailySalesReport: 'Laporan Penjualan Harian',
        dailySalesDescription: 'Laporan penjualan harian via email',
      },
    },
    analytics: {
      title: 'Dashboard Analytics',
      subtitle: 'Analisis performa dan insights bisnis',
      selectPeriod: 'Pilih periode',
      last3Months: '3 Bulan Terakhir',
      last6Months: '6 Bulan Terakhir',
      lastYear: 'Tahun Lalu',
      export: 'Export',
      totalRevenue: 'Total Pendapatan',
      totalUsers: 'Total Pengguna',
      totalStores: 'Total Toko',
      totalOrders: 'Total Pesanan',
      fromLastMonth: 'dari bulan lalu',
      activeStores: 'Toko aktif',
      allTimeOrders: 'Semua pesanan',
      userGrowth: 'Pertumbuhan Pengguna',
      userGrowthDescription: 'Pertumbuhan pengguna dari waktu ke waktu',
      newUsers: 'Pengguna Baru',
      revenueTrends: 'Tren Pendapatan',
      revenueTrendsDescription: 'Tren pendapatan dan jumlah order',
      revenue: 'Pendapatan',
      orders: 'Pesanan',
      roleDistribution: 'Distribusi Role',
      roleDistributionDescription: 'Distribusi pengguna berdasarkan role',
      storePerformance: 'Performa Toko',
      storePerformanceDescription: 'Performa penjualan per toko',
      errorLoading: 'Kesalahan saat memuat data analitik',
      errorLoadingDescription: 'Gagal mengambil data analitik',
      tryAgain: 'Coba Lagi',
    },
    userManagement: {
      title: 'Manajemen User',
      subtitle: 'Kelola pengguna dan approval akun baru',
      addNewUser: 'Tambah User Baru',
      totalUsers: 'Total User',
      activeUsers: 'User Aktif',
      pendingApproval: 'Menunggu Persetujuan',
      suspended: 'Tersuspend',
      allUsers: 'Semua pengguna terdaftar',
      activeUsersDescription: 'Pengguna aktif',
      pendingDescription: 'Menunggu persetujuan',
      suspendedDescription: 'User yang disuspend',
      filterSearch: 'Filter & Pencarian',
      filterSearchDescription: 'Cari dan filter pengguna berdasarkan kriteria',
      searchPlaceholder: 'Cari berdasarkan nama atau email...',
      filterRole: 'Filter berdasarkan role',
      filterStatus: 'Filter berdasarkan status',
      allRoles: 'Semua Role',
      allStatus: 'Semua Status',
      active: 'Aktif',
      pending: 'Pending',
      userList: 'Daftar Pengguna',
      usersCount: 'dari',
      noUsersFound: 'Tidak ada pengguna ditemukan',
      joinedOn: 'Bergabung:',
      approve: 'Setujui',
      reject: 'Tolak',
      suspend: 'Tangguhkan',
      activate: 'Aktifkan',
      editUser: 'Edit User',
      deleteUser: 'Hapus User',
      addUserTitle: 'Tambah User Baru',
      addUserDescription: 'Buat akun user baru dengan penugasan role',
      editUserTitle: 'Edit User',
      editUserDescription: 'Perbarui informasi user dan penugasan role',
      fullName: 'Nama Lengkap',
      fullNamePlaceholder: 'Masukkan nama lengkap',
      emailPlaceholder: 'Masukkan alamat email',
      passwordPlaceholder: 'Masukkan password',
      selectRole: 'Pilih role',
      selectStatus: 'Pilih status',
      inactive: 'Tidak Aktif',
      creating: 'Membuat...',
      createUser: 'Buat User',
      updating: 'Memperbarui...',
      updateUser: 'Perbarui User',
      deleteConfirmTitle: 'Apakah Anda yakin?',
      deleteConfirmDescription: 'Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun user secara permanen dan menghapus semua data terkait.',
      deleting: 'Menghapus...',
      userApproved: 'User disetujui',
      userApprovedDescription: 'User telah berhasil diaktifkan',
      userRejected: 'User ditolak',
      userRejectedDescription: 'User telah berhasil disuspend',
      userSuspended: 'User disuspend',
      userSuspendedDescription: 'User telah berhasil disuspend',
      userActivated: 'User diaktifkan',
      userActivatedDescription: 'User telah berhasil diaktifkan',
      userAdded: 'User berhasil ditambahkan',
      userAddedDescription: 'dengan role',
      userUpdated: 'User berhasil diupdate',
      userUpdatedDescription: 'Data user telah berhasil diperbarui',
      userDeleted: 'User berhasil dihapus',
      userDeletedDescription: 'telah berhasil dihapus',
      approveError: 'Gagal menyetujui user',
      rejectError: 'Gagal menolak user',
      suspendError: 'Gagal mensuspend user',
      activateError: 'Gagal mengaktifkan user',
      addError: 'Gagal menambahkan user',
      updateError: 'Gagal mengupdate user',
      deleteError: 'Gagal menghapus user',
      accessDenied: 'Akses ditolak',
      accessDeniedDescription: 'Anda tidak memiliki izin untuk membuat user baru',
      authFailed: 'Autentikasi gagal',
      authFailedDescription: 'Silakan login kembali',
      sessionExpired: 'Sesi berakhir',
      sessionExpiredDescription: 'Silakan login kembali',
      emailExists: 'Email sudah terdaftar',
      emailExistsDescription: 'Email yang dimasukkan sudah digunakan oleh user lain',
      unknownError: 'Terjadi kesalahan yang tidak diketahui',
      noValidSession: 'Tidak ada sesi valid. Silakan login kembali.',
      failedToCreateUser: 'Gagal membuat user',
    },
    products: {
      errorFetchingCategories: 'Gagal memuat kategori',
      errorFetchingProducts: 'Gagal memuat produk',
      validation: {
        nameRequired: 'Nama produk wajib diisi',
        nameMinLength: 'Nama produk minimal 3 karakter',
        skuRequired: 'SKU wajib diisi',
        skuMinLength: 'SKU minimal 3 karakter',
        categoryRequired: 'Kategori wajib dipilih',
        priceRequired: 'Harga harus lebih dari 0',
        minimumStockRequired: 'Minimum stok harus minimal 1',
        skuExists: 'SKU sudah digunakan produk lain',
      },
      productUpdated: 'Produk berhasil diperbarui',
      productAdded: 'Produk berhasil ditambahkan',
    },
    staff: {
      title: 'Manajemen Staff',
      subtitle: 'Kelola staff dan kontrol akses sistem',
      inviteStaff: 'Undang Staff',
      editStaff: 'Edit Staff',
      deleteStaff: 'Hapus Staff',
      staffManagement: 'Manajemen Staff',
      totalStaff: 'Total Staff',
      activeStaff: 'Staff Aktif',
      pendingInvites: 'Undangan Pending',
      warehouseStaff: 'Staff Warehouse',
      kasirStaff: 'Staff Kasir',
      searchPlaceholder: 'Cari staff...',
      allRoles: 'Semua Role',
      allStatus: 'Semua Status',
      allBranches: 'Semua Cabang',
      noStaffFound: 'Tidak ada staff ditemukan',
      lastLogin: 'Last Login',
      invitation: 'Invitation',
      password: 'Password',
      actions: 'Actions',
      branch: 'Cabang',
      editStaffAction: 'Edit Staff',
      managePermissions: 'Manage Permissions',
      resendInvitation: 'Resend Invitation',
      copyPassword: 'Copy Password',
      viewActivity: 'View Activity',
      activate: 'Activate',
      deactivate: 'Deactivate',
      deleteStaffAction: 'Delete Staff',
      inviteNewStaff: 'Invite New Staff',
      addStaffMemberDescription: 'Add new staff member with secure password setup',
      staffName: 'Nama Staff',
      email: 'Email',
      role: 'Role',
      permissions: 'Permissions',
      passwordSetup: 'Password Setup',
      sendWelcomeEmail: 'Kirim Welcome Email',
      generatePassword: 'Generate Password',
      manualPassword: 'Password Manual',
      invitationEmail: 'Email Invitation',
      customPassword: 'Custom Password',
      showPassword: 'Tampilkan Password',
      hidePassword: 'Sembunyikan Password',
      passwordStrength: 'Kekuatan Password',
      inviteStaffButton: 'Undang Staff',
      cancel: 'Batal',
      updateStaff: 'Update Staff',
      staffAdded: 'Staff ditambahkan',
      staffUpdated: 'Data diperbarui',
      staffDeleted: 'Staff dihapus',
      invitationSent: 'Invitation terkirim',
      invitationResent: 'Invitation terkirim',
      passwordCopied: 'Password disalin',
      failedToAddStaff: 'Gagal menambahkan staff',
      failedToUpdateStaff: 'Gagal memperbarui data staff',
      failedToDeleteStaff: 'Gagal menghapus staff',
      failedToLoadStaffData: 'Gagal memuat data staff',
      passwordOptions: {
        generate: {
          label: 'Generate Password Otomatis',
          description: 'Sistem akan membuat password sementara yang aman',
        },
        manual: {
          label: 'Set Password Manual',
          description: 'Admin menentukan password untuk staff',
        },
        invitation: {
          label: 'Kirim Email Invitation',
          description: 'Staff akan menerima email untuk set password sendiri',
        },
      },
      roles: {
        admin: 'Admin',
        kasir: 'Kasir',
        warehouse: 'Warehouse',
      },
      status: {
        active: 'Aktif',
        inactive: 'Tidak Aktif',
        pending: 'Menunggu',
      },
      invitationStatus: {
        sent: 'Terkirim',
        accepted: 'Diterima',
        expired: 'Expired',
        resent: 'Dikirim Ulang',
      },
      passwordStatus: {
        temporary: 'Sementara',
        permanent: 'Permanen',
        notSet: 'Belum Set',
      },
      messages: {
        passwordEmpty: 'Password kosong',
        passwordEmptyDescription: 'Password harus diisi untuk melanjutkan',
        passwordWeak: 'Password lemah',
        passwordWeakDescription: 'Password tidak memenuhi kriteria keamanan yang diperlukan',
        staffActivated: 'diaktifkan',
        staffDeactivated: 'dinonaktifkan',
        staffStatusChanged: 'berhasil',
        mustChange: 'Must change',
        expired: 'Expired',
        copy: 'Copy',
      },
    },
    stock: {
      errorFetchingProducts: 'Gagal memuat produk',
      errorFetchingStores: 'Gagal memuat data cabang',
      errorFetchingMovements: 'Gagal memuat riwayat stok',
    },
    stores: {
      errorLoadingData: 'Gagal memuat data',
      title: 'Manajemen Toko',
      subtitle: 'Kelola cabang toko dan monitor performa penjualan',
      addStore: 'Tambah Toko',
      editStore: 'Edit Toko',
      deleteStore: 'Hapus Toko',
      storeManagement: 'Manajemen Toko',
      totalStores: 'Total Toko',
      totalStaff: 'Total Staff',
      monthlyRevenue: 'Revenue Bulanan',
      averagePerStore: 'Rata-rata per Toko',
      active: 'aktif',
      fromLastMonth: '+12% dari bulan lalu',
      averagePerStoreRevenue: 'Rata-rata per Toko',
      revenuePerBranch: 'Revenue per cabang',
      storeList: 'Daftar Cabang Toko',
      storeListDescription: 'Kelola dan monitor semua cabang toko Anda',
      storeName: 'Nama Toko',
      location: 'Lokasi',
      manager: 'Manager',
      staff: 'Staff',
      status: 'Status',
      monthlyRevenueLabel: 'Revenue Bulanan',
      actions: 'Aksi',
      edit: 'Edit',
      assignStaff: 'Assign Staff',
      delete: 'Hapus',
      addNewStore: 'Tambah Toko Baru',
      updateStoreInfo: 'Perbarui informasi toko yang sudah ada',
      addNewBranch: 'Tambahkan cabang toko baru ke dalam sistem',
      address: 'Alamat',
      city: 'Kota',
      phone: 'Telepon',
      optional: 'Opsional',
      cancel: 'Batal',
      update: 'Perbarui',
      add: 'Tambah',
      assignStaffToStore: 'Assign Staff ke Toko',
      selectStaffToAssign: 'Pilih staff yang akan di-assign ke',
      availableStaff: 'Staff yang Tersedia:',
      noAvailableStaff: 'Tidak ada staff yang tersedia',
      selectedStaff: 'Staff Terpilih:',
      currentlyAt: 'Saat ini di:',
      assignStaffCount: 'Assign Staff',
      storeUpdated: 'Toko berhasil diperbarui',
      storeAdded: 'Toko berhasil ditambahkan',
      storeDeleted: 'Toko berhasil dihapus',
      staffAssigned: 'Staff berhasil di-assign ke toko',
      staffAssignedDescription: 'staff berhasil ditugaskan ke',
      failedToSaveStore: 'Gagal menyimpan data toko',
      failedToDeleteStore: 'Gagal menghapus toko',
      errorLoadingStoresData: 'Error Loading Stores Data',
      tryAgain: 'Try Again',
      statusLabels: {
        active: 'Aktif',
        inactive: 'Tidak Aktif',
        maintenance: 'Maintenance',
      },
    },
    categories: {
      errorFetchingCategories: 'Gagal memuat kategori',
      errorFetchingProducts: 'Gagal memuat produk',
    },
    customers: {
      errorFetchingCustomers: 'Gagal memuat data pelanggan',
      errorFetchingTransactions: 'Gagal memuat riwayat transaksi',
    },
    reports: {
      title: 'Laporan Stok',
      subtitle: 'Monitoring pergerakan stok dan analisis inventory',
      exportExcel: 'Export Excel',
      exportPDF: 'Export PDF',
      filterReport: 'Filter Laporan',
      startDate: 'Tanggal Mulai',
      endDate: 'Tanggal Akhir',
      category: 'Kategori',
      reportType: 'Jenis Laporan',
      allCategories: 'Semua Kategori',
      stockSummary: 'Ringkasan Stok',
      movementDetail: 'Detail Pergerakan',
      categoryAnalysis: 'Analisis Kategori',
      totalProducts: 'Total Produk',
      lowStock: 'Stok Menipis',
      inventoryValue: 'Nilai Inventory',
      movements: 'Pergerakan',
      productsRegistered: 'Produk terdaftar',
      needRefill: 'Perlu diisi ulang',
      totalStockValue: 'Total nilai stok',
      inThisPeriod: 'Dalam periode ini',
      stockIn: 'Stok Masuk',
      stockOut: 'Stok Keluar',
      totalUnitsIn: 'Total unit masuk dalam periode',
      totalUnitsOut: 'Total unit keluar dalam periode',
      categoryBreakdown: 'Breakdown per Kategori',
      products: 'Produk',
      totalStock: 'Total Stok',
      value: 'Nilai',
      movement: 'Pergerakan',
      stockSummaryPerProduct: 'Ringkasan Stok per Produk',
      stockSummaryDescription: 'Laporan detail stok dan pergerakan untuk setiap produk',
      noDataForPeriod: 'Tidak ada data untuk periode yang dipilih',
      product: 'Produk',
      currentStock: 'Stok Saat Ini',
      minStock: 'Min. Stok',
      totalIn: 'Total Masuk',
      totalOut: 'Total Keluar',
      totalMovements: 'Pergerakan',
      lastMovement: 'Terakhir',
      status: 'Status',
      normal: 'Normal',
      running_low: 'Menipis',
      stockMovementDetail: 'Detail Pergerakan Stok',
      stockMovementDescription: 'Riwayat lengkap pergerakan stok dalam periode yang dipilih',
      noMovementInPeriod: 'Tidak ada pergerakan stok dalam periode yang dipilih',
      date: 'Tanggal',
      type: 'Jenis',
      quantity: 'Jumlah',
      notes: 'Catatan',
      by: 'Oleh',
      in: 'Masuk',
      out: 'Keluar',
      transfer: 'Transfer',
      adjustment: 'Penyesuaian',
      excelDownloaded: 'Laporan Excel berhasil diunduh',
      pdfDownloaded: 'Laporan PDF berhasil diunduh',
      categoryLabels: {
        device: 'Device',
        liquid: 'Liquid',
        peripheral: 'Peripheral',
        service: 'Service',
      },
    },
    auditLog: {
      title: 'Audit Log',
      description: 'Riwayat aktivitas sistem dan pengguna',
      action: 'Aksi',
      entity: 'Entitas',
      user: 'User',
      details: 'Detail',
      time: 'Waktu',
      view: 'Lihat',
      noData: 'Tidak ada data audit log',
      filters: {
        search: 'Cari',
        actionType: 'Tipe Aksi',
        entity: 'Entitas',
        all: 'Semua',
        startDate: 'Tanggal Mulai',
        endDate: 'Tanggal Selesai',
        perPage: 'Per Halaman',
        moreFilters: 'Filter Lainnya',
        reset: 'Reset',
      },
      tabs: {
        changes: 'Perubahan',
        rawData: 'Data Mentah',
      },
      labels: {
        before: 'Sebelum',
        after: 'Sesudah',
        newData: 'Data Baru',
        deletedData: 'Data yang Dihapus',
        noChanges: 'Tidak ada perubahan terdeteksi',
        noData: 'Tidak ada data',
      },
      stats: {
        totalLogs: 'Total Log',
        today: 'Hari Ini',
        last24Hours: '24 Jam Terakhir',
        last7Days: '7 Hari Terakhir',
      },
      realtime: {
        active: 'Realtime Aktif',
        offline: 'Offline',
      },
      export: {
        csv: 'Export CSV',
      },
    },
  },
  en: {
    common: {
      dashboard: 'Dashboard',
      settings: 'Settings',
      logout: 'Logout',
      profile: 'Profile',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      yes: 'Yes',
      no: 'No',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset',
      monthly: 'Monthly',
      yearly: 'Yearly',
      month: 'month',
      year: 'year',
      store: 'store',
      stores: 'stores',
      unlimited: 'Unlimited',
      maximum: 'Maximum',
    },
    navigation: {
      dashboard: 'Dashboard',
      userManagement: 'User Management',
      analytics: 'Analytics',
      settings: 'Settings',
      stores: 'Stores',
      staff: 'Staff',
      reports: 'Reports',
      products: 'Products',
      categories: 'Categories',
      stock: 'Stock',
      pos: 'POS',
      transactions: 'Transactions',
      customers: 'Customers',
      trialManagement: 'Trial Management',
      manualActivation: 'Manual Activation',
      auditLogs: 'Audit Logs',
      invoiceManagement: 'Invoice Management',
    },
    roles: {
      superadmin: 'Super Admin',
      admin: 'Admin',
      warehouse: 'Warehouse',
      kasir: 'Cashier',
    },
    auth: {
      signIn: 'Sign In',
      signOut: 'Sign Out',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      loginTitle: 'Sign in to your account',
      loginSubtitle: 'Enter your email and password to access the dashboard',
      emailPlaceholder: 'name@email.com',
      passwordPlaceholder: 'Enter your password',
      loginError: 'An error occurred during login',
      noAccess: 'Don\'t have access yet?',
      orderNow: 'Order now',
    },
    nav: {
      features: 'Features',
      pricing: 'Pricing',
      testimonials: 'Testimonials',
      faq: 'FAQ',
      cta: 'Try Free',
      signin: 'Sign In',
    },
    landing: {
      hero: {
        badge: '🇮🇩 #1 POS Solution for Vape Shops',
        title: 'Manage Your Vape Shop Easier & More Professionally',
        subtitle:
          'Track liquids, transactions, and business reports in one dashboard. Built specifically for vape shop owners in Indonesia.',
        cta_trial: 'Try Free 14 Days',
        cta_demo: 'See Demo',
        dashboard_alt: 'VaporPOS dashboard preview',
      },
      features: {
        label: 'KEY FEATURES',
        title: 'Everything You Need for Your Vape Shop',
        subtitle:
          'From liquid stock management to financial reports, all complete in VaporPOS.',
        items: [
          {
            icon: 'Store',
            title: 'Multi-Store',
            desc:
              'Manage multiple store branches from one account. Monitor stock and sales per branch in real-time.',
          },
          {
            icon: 'Package',
            title: 'Product Catalog',
            desc:
              'Organize devices, liquids, peripherals, and rebuild services. Clean categorization with photos & prices.',
          },
          {
            icon: 'Users',
            title: 'Role-Based Access',
            desc:
              'Superadmin, admin, warehouse, cashier — each role has access according to their tasks.',
          },
          {
            icon: 'BarChart3',
            title: 'Reports & Analytics',
            desc:
              'Daily, weekly, monthly sales reports. Track best-selling products and profit margins.',
          },
          {
            icon: 'Shield',
            title: 'Data Security',
            desc:
              'Transaction and customer data secure with encryption. Automatic cloud backup.',
          },
          {
            icon: 'Cloud',
            title: 'Cloud-Based',
            desc:
              'Access from anywhere — laptop, tablet, or phone. No server installation needed.',
          },
        ],
      },
      testimonials: {
        label: 'TESTIMONIALS',
        title: 'Trusted by Hundreds of Vape Shops in Indonesia',
        subtitle: 'Hear directly from vape shop owners who use VaporPOS.',
        items: [
          {
            quote:
              'Before VaporPOS, liquid stock was always off. Now everything is neatly recorded, reports are just a click away. Highly recommended!',
            name: 'Andi Pratama',
            shop: 'AndiVape Store',
            city: 'Jakarta',
          },
          {
            quote:
              'The multi-store feature is amazing. I have 3 branches and I can monitor all of them from one dashboard. No more store-hopping.',
            name: 'Rina Susanti',
            shop: 'Cloud9 Vapor',
            city: 'Bandung',
          },
          {
            quote:
              'Their support is fast response. When I first switched from manual records, the VaporPOS team helped migrate my data until it was done. Top!',
            name: 'Budi Hartono',
            shop: 'VapeKing',
            city: 'Surabaya',
          },
        ],
      },
      pricing: {
        label: 'PRICING',
        title: 'Flexible Pricing Plans',
        subtitle: "From small shops to mid-size chains, there's a plan that fits you.",
        monthly: 'Monthly',
        yearly: 'Yearly',
        save: 'Save 17%',
        popular: 'POPULAR',
        plans: [
          {
            id: 'single',
            name: 'Single Store',
            price: '50K',
            period: '/mo',
            features: [
              '1 store',
              '5 user access',
              'Unlimited products',
              'Basic reports',
              'Email support',
              'Cloud backup',
            ],
          },
          {
            id: 'multi5',
            name: 'Multi Store 5',
            price: '150K',
            period: '/mo',
            popular: true,
            features: [
              '5 stores',
              '15 user access',
              'Unlimited products',
              'Advanced reports',
              'Multi-store dashboard',
              'Priority support',
              'Data export',
              'Cloud backup',
            ],
          },
          {
            id: 'multi20',
            name: 'Multi Store 20',
            price: '250K',
            period: '/mo',
            features: [
              '20 stores',
              '50 user access',
              'Unlimited products',
              'Advanced reports',
              'Custom analytics',
              '24/7 priority support',
              'Data export',
              'Cloud backup',
            ],
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            features: [
              '>20 stores',
              'Unlimited users',
              'Unlimited products',
              'Dedicated support',
              'Custom integration',
              'On-premise option',
              'SLA guarantee',
              'Priority feature request',
            ],
          },
        ],
        cta: 'Select Plan',
        contact: 'Contact Us',
      },
      showcase: {
        label: 'APP PREVIEW',
        title: 'Clean & Easy-to-Use Dashboard',
        subtitle: 'Modern interface that makes store operations more efficient.',
        items: [
          {
            title: 'Dashboard Overview',
            desc:
              'Monitor sales, stock, and store performance on one screen. Interactive charts with real-time updates.',
            alt: 'VaporPOS dashboard overview',
          },
          {
            title: 'Stock Management',
            desc:
              'Manage hundreds of liquid, device, and peripheral SKUs easily. Automatic low-stock notifications.',
            alt: 'VaporPOS stock management',
          },
          {
            title: 'Point of Sale',
            desc:
              'Fast transactions with an intuitive interface. Supports multiple payment methods and receipt printing.',
            alt: 'VaporPOS point of sale',
          },
        ],
      },
      faq: {
        title: 'Frequently Asked Questions',
        subtitle: 'Got questions? Check here first.',
        items: [
          {
            q: 'What is VaporPOS?',
            a: 'VaporPOS is a cloud-based Point of Sale (POS) application designed specifically for vape shops in Indonesia. From sales recording, liquid and device stock management, to financial reports — all in one app.',
          },
          {
            q: 'Can I use it for multiple branches?',
            a: 'Absolutely! VaporPOS supports multi-store. Monitor stock, sales, and performance of each branch from a single dashboard.',
          },
          {
            q: 'How secure is my data?',
            a: 'Data security is our priority. All data is encrypted, stored on secure cloud servers, and automatically backed up.',
          },
          {
            q: 'Is there a free trial?',
            a: 'Yes! You can try VaporPOS free for 14 days. No credit card required — sign up and start using immediately.',
          },
          {
            q: 'What if I need help?',
            a: 'Our support team is ready to help via WhatsApp, email, or live chat from the dashboard. Average response time under 1 hour.',
          },
          {
            q: 'Can it integrate with other tools?',
            a: 'VaporPOS currently supports Midtrans for digital payments and Fonnte for WhatsApp notifications. More integrations coming soon!',
          },
        ],
        support_text: 'Still have questions?',
        support_link: 'Contact Support',
      },
      cta: {
        title: 'Ready to Take Your Vape Shop to the Next Level?',
        subtitle: 'Sign up now and enjoy 14 days free. No credit card, cancel anytime.',
        cta_trial: 'Start Free 14 Days',
        cta_demo: 'Schedule a Demo',
        trust: 'No credit card • 14 days free • Cancel anytime',
      },
      heroTitle: 'Leading POS System for Vapor Business',
      heroSubtitle:
        'Manage your vapor store with ease. From devices, liquids, peripherals to recoil services - all in one powerful and user-friendly platform.',
      getStarted: 'Get Started',
      tryFree: 'Try Free for 14 Days',
      viewDemo: 'View Demo',
      about: 'About',
      featuresTitle: 'Complete Features for Vapor Business',
      featuresSubtitle: 'Everything you need to manage a modern vapor business',
      multiStore: {
        title: 'Multi-Store Management',
        description:
          'Manage multiple vapor store branches from one centralized dashboard',
      },
      roleAccess: {
        title: 'Role-Based Access',
        description: 'Complete role system: Admin, Warehouse, and Cashier',
      },
      analytics: {
        title: 'Analytics & Reporting',
        description: 'Real-time sales reports with charts and deep insights',
      },
      secure: {
        title: 'Secure & Reliable',
        description: 'Enterprise-level security with automatic backup',
      },
      performance: {
        title: 'Fast Performance',
        description: 'Fast and responsive interface for daily transactions',
      },
      cloud: {
        title: 'Cloud-Based',
        description:
          'Access from anywhere, anytime with real-time synchronization',
      },
      pricingTitle: 'Choose the Right Plan',
      pricingSubtitle: 'Save up to 2 months with annual plans',
      saveTwoMonths: 'Save 2 months',
      mostPopular: 'Most Popular',
      selectPlan: 'Select Plan',
      ctaTitle: 'Ready to Grow Your Vapor Business?',
      ctaSubtitle: 'Join thousands of vapor store owners who trust VaporPos',
      startNowFree: 'Start Now - Free for 14 Days',
      footerDescription: 'Leading POS system for vapor business in Indonesia',
      product: 'Product',
      support: 'Support',
      company: 'Company',
      allRightsReserved: 'All rights reserved',
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions about VaporPos',
      questions: {
        q1: {
          question: 'What is VaporPos and how does it work?',
          answer: 'VaporPos is a Point of Sale (POS) system specifically designed for vapor and vape shop businesses. This system helps you manage inventory, sales, customers, and business reports in one integrated platform. You can access the system from anywhere through our cloud-based platform.'
        },
        q2: {
          question: 'Does VaporPos support multiple stores?',
          answer: 'Yes, VaporPos supports multi-store management. You can manage up to 5, 20, or unlimited store branches depending on the package you choose. All data will be synchronized in real-time across branches.'
        },
        q3: {
          question: 'How is data security in VaporPos?',
          answer: 'We use enterprise-level encryption and automatic backup to keep your data secure. All data is stored on secure cloud servers with international security certifications. Data access is also protected with role-based access control system.'
        },
        q4: {
          question: 'Is there a free trial available?',
          answer: 'Yes, we provide a 14-day free trial for all packages. You can try all features without providing credit card information. After the trial ends, you can choose a package that suits your business needs.'
        },
        q5: {
          question: 'How to get technical support?',
          answer: 'We provide 24/7 support through various channels: live chat, email, and WhatsApp. Our support team consists of experts experienced in the vapor industry and POS systems. We also provide complete documentation and video tutorials.'
        },
        q6: {
          question: 'Can VaporPos integrate with other systems?',
          answer: 'Not yet, we are still developing integration with other systems that support your business needs.'
        }
      }
    },
    pricing: {
      singleStore: {
        name: 'Single Store',
        description: 'Perfect for one vapor store',
        features: [
          'Complete POS dashboard',
          'Inventory management',
          'Sales reports',
          'Multi-user (Admin, Warehouse, Cashier)',
          '24/7 Support',
        ],
      },
      multiStore5: {
        name: 'Multi Store (5)',
        description: 'For business with up to 5 branches',
        features: [
          'All Single Store features',
          'Multi-store management',
          'Cross-branch analytics',
          'Staff assignment',
          'Inventory transfer',
          'Consolidated reporting',
        ],
      },
      multiStore20: {
        name: 'Multi Store (20)',
        description: 'For business with up to 20 branches',
        features: [
          'All Multi Store (5) features',
          'Advanced analytics',
          'Custom reporting',
          'API access',
          'Priority support',
          'Training session',
        ],
      },
      enterprise: {
        name: 'Enterprise',
        description: 'For business with 20+ branches',
        features: [
          'All Multi Store (20) features',
          'Unlimited stores',
          'Custom integrations',
          'Dedicated support',
          'On-premise option',
          'Custom development',
        ],
      },
    },
    footer: {
      brand_desc:
        'Complete POS solution for vape shops in Indonesia. Manage your store easier with VaporPOS.',
      product: 'Product',
      product_links: {
        features: 'Features',
        pricing: 'Pricing',
        showcase: 'Preview',
        faq: 'FAQ',
      },
      support: 'Support',
      support_links: {
        help: 'Help Center',
        contact: 'Contact',
        docs: 'Documentation',
      },
      company: 'Company',
      company_links: {
        about: 'About',
        blog: 'Blog',
        privacy: 'Privacy',
        terms: 'Terms',
      },
      copyright: '© {year} VaporPOS. All rights reserved.',
    },
    legacyFooter: {
      product: {
        title: 'Product',
        items: [
          'POS System',
          'Inventory Management',
          'Analytics',
          'Multi-Store',
        ],
      },
      support: {
        title: 'Support',
        items: ['Help Center', 'Documentation', 'Contact Us', 'Training'],
      },
      company: {
        title: 'Company',
        items: ['About Us', 'Privacy Policy', 'Terms of Service', 'Blog'],
      },
    },
    order: {
      title: 'Choose VaporPos Package',
      subtitle: 'Start your vapor business digital transformation today',
      selectPlan: 'Select Plan',
      orderInfo: 'Order Information',
      orderDetails: 'Order Details',
      orderDescription: 'Fill in the information below to continue ordering',
      fullName: 'Full Name *',
      fullNamePlaceholder: 'Enter full name',
      emailPlaceholder: 'name@email.com',
      companyName: 'Company/Store Name *',
      companyPlaceholder: 'Vapor store name',
      phoneNumber: 'Phone Number *',
      phonePlaceholder: '08xxxxxxxxxx',
      fullAddress: 'Full Address *',
      addressPlaceholder: 'Complete store/office address',
      additionalNotes: 'Additional Notes',
      notesPlaceholder: 'Special requirements or questions',
      orderSummary: 'Order Summary',
      package: 'Package:',
      period: 'Period:',
      discount: 'Discount:',
      total: 'Total:',
      processing: 'Processing...',
      continuePayment: 'Continue to Payment',
      orderSuccess: 'Order created successfully! Our team will contact you soon.',
      orderError: 'An error occurred. Please try again.',
      paymentSuccess: 'Payment successful! Your tenant account will be created soon.',
      paymentSuccessDescription: 'Thank you for your payment. Your account will be activated within a few minutes.',
      paymentPending: 'Payment is being processed. Please wait for confirmation.',
      paymentPendingDescription: 'Your payment is being verified. We will send a notification once completed.',
      paymentError: 'Payment failed. Please try again.',
      paymentErrorDescription: 'An error occurred while processing payment. Please check your payment details and try again.',
      login: 'Login',
    },
    register: {
      title: 'Start Free Trial',
      subtitle: 'Start your 14-day free VaporPOS trial now',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Enter your full name',
      emailPlaceholder: 'Enter your email address',
      passwordPlaceholder: 'Enter password (min. 6 characters)',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Re-enter your password',
      companyName: 'Company Name',
      companyPlaceholder: 'Enter your vapor store/company name',
      phoneNumber: 'Phone Number',
      phonePlaceholder: 'Enter your phone number',
      address: 'Address',
      addressPlaceholder: 'Enter your company/store address (optional)',
      startTrial: 'Start Free Trial',
      processing: 'Processing...',
      alreadyHaveAccount: 'Already have an account?',
      trialInfo: '🎉 14-day free trial with no credit card required. Full access to all VaporPos features!',
      nameRequired: 'Full name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Invalid email format',
      passwordRequired: 'Password is required',
      passwordTooShort: 'Password must be at least 6 characters',
      passwordMismatch: 'Password confirmation does not match',
      companyRequired: 'Company name is required',
      phoneRequired: 'Phone number is required',
      success: 'Registration Successful!',
      successDescription: 'Please check your email to verify your account',
      checkEmail: 'Please check your email for verification',
      emailExists: 'Email already registered',
      error: 'Registration failed',
      networkError: 'Network error, please try again',
    },
    verifyEmail: {
      title: 'Verify Email',
      subtitle: 'We have sent a verification link to your email',
      verified: 'Email Verified!',
      verificationFailed: 'Verification Failed',
      verifying: 'Verifying...',
      verifyingDescription: 'Verifying your email, please wait...',
      successDescription: 'Your email has been successfully verified. Your 14-day trial has started!',
      errorDescription: 'Failed to verify email. Please try resending the verification link.',
      sentTo: 'Verification email sent to:',
      checkInbox: 'Please check your email inbox and click the verification link',
      resendEmail: 'Resend Email',
      resending: 'Sending...',
      resendIn: 'Resend in',
      resendSuccess: 'Verification email resent successfully',
      resendError: 'Failed to resend verification email',
      emailRequired: 'Email is required',
      emailNotFound: 'Email not found',
      tooManyRequests: 'Too many requests, please try again later',
      invalidToken: 'Invalid verification token',
      tokenNotFound: 'Verification token not found',
      error: 'Failed to verify email',
      networkError: 'Network error, please try again',
      success: 'Email verified successfully',
      canNowLogin: 'You can now login to the dashboard',
      redirecting: 'Redirecting to login page in 3 seconds...',
      goToLogin: 'Go to Dashboard',
      backToRegister: 'Back to Registration',
      helpText: 'Did not receive email? Check your spam folder or resend verification email.',
    },
    orders: {
      title: 'Order Management',
      subtitle: 'Manage customer orders and payments',
      refresh: 'Refresh',
      export: 'Export',
      filters: 'Filters',
      search: 'Search',
      searchPlaceholder: 'Email, name, company...',
      status: 'Status',
      planType: 'Plan Type',
      fromDate: 'From Date',
      toDate: 'To Date',
      allStatus: 'All Status',
      allPlans: 'All Plans',
      pending: 'Pending',
      paid: 'Paid',
      failed: 'Failed',
      expired: 'Expired',
      orderId: 'Order ID',
      customer: 'Customer',
      plan: 'Plan',
      amount: 'Amount',
      tenant: 'Tenant',
      created: 'Created',
      actions: 'Actions',
      created_: 'Created',
      notCreated: 'Not Created',
      orderDetails: 'Order Details',
      orderInfo: 'Order Information',
      customerInfo: 'Customer Information',
      paymentInfo: 'Payment Information',
      statusHistory: 'Status History',
      gateway: 'Gateway',
      method: 'Method',
      transactionId: 'Transaction ID',
      name: 'Name',
      company: 'Company',
      address: 'Address',
      notes: 'Notes',
      changedBy: 'Changed By',
      oldStatus: 'Old Status',
      newStatus: 'New Status',
      changeNotes: 'Change Notes',
      updateStatus: 'Update Status',
      createTenant: 'Create Tenant Account',
      createTenantConfirm: 'Create Tenant Account',
      createTenantDescription: 'This will create a new tenant account and send them login credentials.',
      tenantCreated: 'Tenant account created successfully!',
      tenantCreationFailed: 'Failed to create tenant account',
      statusUpdated: 'Order status updated successfully',
      statusUpdateFailed: 'Failed to update order status',
      fetchError: 'Failed to fetch order data',
      networkError: 'Network error. Please check your internet connection.',
      showing: 'Showing',
      to: 'to',
      of: 'of',
      previous: 'Previous',
      next: 'Next',
      noData: 'No order data available',
      loadingOrders: 'Loading orders...',
      loadingDetails: 'Loading order details...',
    },
    dashboard: {
      welcome: 'Welcome',
      overview: 'Overview',
      statistics: 'Statistics',
      recentActivity: 'Recent Activity',
      quickActions: 'Quick Actions',
      viewAll: 'View All',
      noData: 'No data available',
      loading: 'Loading...',
      error: 'An error occurred',
      refresh: 'Refresh',
    },
    superadminDashboard: {
      title: 'Super Admin Dashboard',
      subtitle: 'Manage global system and all tenants',
      totalUsers: 'Total Users',
      totalStores: 'Total Stores',
      totalRevenue: 'Total Revenue',
      pendingOrders: 'Pending Orders',
      recentOrders: 'Recent Orders',
      orderFrom: 'Order from',
      approve: 'Approve',
      reject: 'Reject',
      viewDetails: 'View Details',
      noOrders: 'No pending orders',
      users: 'users',
      stores: 'stores',
      revenue: 'revenue',
      orders: 'orders',
      recentUsers: 'Recent Users',
      usersDescription: 'Recently registered users',
      noUsers: 'No new users',
      ordersDescription: 'Orders awaiting approval',
      active: 'Active',
      inactive: 'Inactive',
    },
    adminDashboard: {
      title: 'Admin Dashboard',
      subtitle: 'Manage your stores and business operations',
      totalStores: 'Total Stores',
      totalStaff: 'Total Staff',
      totalProducts: 'Total Products',
      monthlyRevenue: 'Monthly Revenue',
      recentActivity: 'Recent Activity',
      quickActions: 'Quick Actions',
      manageStores: 'Manage Stores',
      manageStaff: 'Manage Staff',
      viewReports: 'View Reports',
      addProduct: 'Add Product',
      stores: 'stores',
      staff: 'staff',
      products: 'products',
      revenue: 'revenue',
      addStore: 'Add Store',
      yourStores: 'Your Stores',
      storeListDescription: 'List of stores you manage',
      noStores: 'No stores yet',
      addFirstStore: 'Add First Store',
      created: 'Created',
      active: 'Active',
      inactive: 'Inactive',
      manage: 'Manage',
      latestStaff: 'Latest Staff',
      newStaffDescription: 'Recently joined staff',
      noStaff: 'No staff yet',
      inviteStaff: 'Invite Staff',
      joined: 'Joined',
      warehouse: 'Warehouse',
      cashier: 'Cashier',
    },
    settings: {
      title: 'Settings',
      settingsTitle: 'Settings',
      globalSettings: 'Global System Settings',
      tenantSettings: 'Tenant Settings',
      globalDescription: 'Global system configuration for all tenants',
      tenantDescription: 'System configuration and application settings for your tenant',
      forceRefresh: 'Force Refresh',
      tenantId: 'Tenant ID',
      application: 'Application',
      email: 'Email',
      security: 'Security',
      backup: 'Backup',
      system: 'System',

      applicationDescription: 'General application settings and branding',
      emailDescription: 'Email configuration and notifications',
      securityDescription: 'Security policies and authentication',
      backupDescription: 'Backup and maintenance settings',
      systemDescription: 'System preferences and localization',
      storeBrandingDescription: 'Store information and branding for receipts',
      businessOperationsDescription: 'Business rules, tax, currency, and operational settings',
      receiptSettingsDescription: 'Receipt format, language, and printing preferences',
      notificationSettingsDescription: 'Email, SMS, and alert notifications',
      saving: 'Saving...',
      saveSettings: 'Save Settings',
      settingsSaved: 'Settings saved successfully!',
      settingsError: 'Error saving settings. Please try again.',
      noSettings: 'No settings available for this category',
      debugInfo: 'Debug Info:',
      category: 'Category:',
      totalSettings: 'Total settings:',
      userRole: 'User role:',
      availableCategories: 'Available categories:',
      maintenanceMode: 'Maintenance mode is active',
      maintenanceWarning: 'Maintenance mode is active. Users cannot access the application.',
      previewReceipt: 'Preview Receipt',
      tenantIsolation: 'Tenant Isolation',
      tenantIsolationInfo: 'These settings are isolated for your tenant and will not affect other tenants.',

      emailNotificationsEnabled: 'Email Notifications Enabled',
      emailNotificationsDescription: 'Enable all email notifications',
      whatsappNotifications: 'WhatsApp Notifications',
      whatsappNotificationsEnabled: 'WhatsApp Notifications Enabled',
      whatsappNotificationsDescription: 'Enable notifications via WhatsApp using Fonnte API',
      fonntteApiToken: 'Fonnte API Token',
      fonntteApiTokenPlaceholder: 'Enter API token from Fonnte',
      fonntteApiTokenDescription: 'Get API token from Fonnte Dashboard',
      whatsappAdminNumber: 'WhatsApp Admin Number',
      whatsappAdminNumberPlaceholder: '628123456789',
      whatsappAdminNumberDescription: 'Format: 628123456789 (without + sign and spaces)',
      countryCode: 'Country Code',
      selectCountryCode: 'Select country code',
      indonesia: '🇮🇩 Indonesia (+62)',
      unitedStates: '🇺🇸 United States (+1)',
      unitedKingdom: '🇬🇧 United Kingdom (+44)',
      singapore: '🇸🇬 Singapore (+65)',
      malaysia: '🇲🇾 Malaysia (+60)',
      testMode: 'Test Mode',
      testModeDescription: 'Test mode (messages will not be sent)',
      testing: 'Testing...',
      testWhatsapp: 'Test WhatsApp',
      whatsappTestSuccess: 'WhatsApp test successful! Test message has been sent.',
      whatsappTestFailed: 'WhatsApp test failed:',
      whatsappTestError: 'An error occurred while testing WhatsApp',
      validationError: 'Please fix validation errors first',
      date: 'Date:',
      receiptNumber: 'Receipt #:',
      subtotal: 'Subtotal:',
      tax: 'Tax',
      total: 'Total:',
      scanForReview: 'Scan for review',
      validation: {
        apiTokenRequired: 'API Token is required if WhatsApp notifications are enabled',
        apiTokenTooShort: 'API Token is too short',
        whatsappNumberRequired: 'WhatsApp admin number is required',
        whatsappNumberInvalid: 'Invalid WhatsApp number format',
      },
      whatsapp: {
        fixValidationErrors: 'Please fix validation errors first',
        testSuccess: 'WhatsApp test successful! Test message has been sent.',
        testFailed: 'WhatsApp test failed',
        testError: 'An error occurred while testing WhatsApp',
      },
      storeBranding: {
        storeName: 'Store Name',
        storeAddress: 'Store Address',
        storePhone: 'Store Phone',
        storeEmail: 'Store Email',
        storeLogoUrl: 'Store Logo URL',
        receiptFooterText: 'Receipt Footer Text',
        receiptThankYouMessage: 'Receipt Thank You Message',
        defaultStoreName: 'Vapor Store',
        defaultStoreAddress: '123 Example St, Jakarta',
        defaultStorePhone: '+62 21 1234 5678',
        defaultStoreEmail: 'info@vaporstore.com',
        defaultReceiptFooter: 'Thank you for your visit!',
        defaultThankYouMessage: 'Enjoy your vapor products!',
        storeNamePlaceholder: 'Your store name',
        storeAddressPlaceholder: 'Complete store address',
        storePhonePlaceholder: 'Store phone number',
        storeEmailPlaceholder: 'Store email',
        storeLogoUrlPlaceholder: 'Store logo URL (optional)',
        receiptFooterPlaceholder: 'Footer text on receipt',
        thankYouMessagePlaceholder: 'Thank you message on receipt',
      },
      businessOperations: {
        defaultTaxRate: 'Default Tax Rate',
        currencySymbol: 'Currency Symbol',
        receiptPrintCopies: 'Receipt Print Copies',
        autoPrintReceipt: 'Auto Print Receipt',
        autoPrintReceiptDescription: 'Automatically print receipt after transaction',
        loyaltyProgramEnabled: 'Loyalty Program Enabled',
        loyaltyProgramDescription: 'Enable customer loyalty program',
        minimumStockAlert: 'Minimum Stock Alert',
      },
      receiptSettings: {
        receiptWidth: 'Receipt Width',
        selectPaperWidth: 'Select paper width',
        thermal58mm: '58mm (Thermal small)',
        thermal80mm: '80mm (Thermal standart)',
        showBarcodeOnReceipt: 'Display Barcode on Receipt',
        showBarcodeDescription: 'Display product barcodes on receipts',
        receiptLanguage: 'Receipt Language',
        selectReceiptLanguage: 'Select receipt language',
        indonesian: 'Indonesian',
        english: 'English',
        includeCustomerInfo: 'Include Customer Info',
        includeCustomerInfoDescription: 'Include customer info in receipt',
        receiptQrCodeEnabled: 'QR Code Receipt Enabled',
        qrCodeDescription: 'QR code for feedback/review',
      },
      notificationSettings: {
        lowStockNotifications: 'Low Stock Notifications',
        lowStockDescription: 'Notification when product stock is running low',
        dailySalesReport: 'Daily Sales Report',
        dailySalesDescription: 'Daily sales report via email',
      },
    },
    analytics: {
      title: 'Analytics Dashboard',
      subtitle: 'Business performance analysis and insights',
      selectPeriod: 'Select period',
      last3Months: 'Last 3 Months',
      last6Months: 'Last 6 Months',
      lastYear: 'Last Year',
      export: 'Export',
      totalRevenue: 'Total Revenue',
      totalUsers: 'Total Users',
      totalStores: 'Total Stores',
      totalOrders: 'Total Orders',
      fromLastMonth: 'from last month',
      activeStores: 'Active stores',
      allTimeOrders: 'All time orders',
      userGrowth: 'User Growth',
      userGrowthDescription: 'User growth over time',
      newUsers: 'New Users',
      revenueTrends: 'Revenue Trends',
      revenueTrendsDescription: 'Revenue trends and order count',
      revenue: 'Revenue',
      orders: 'Orders',
      roleDistribution: 'Role Distribution',
      roleDistributionDescription: 'User distribution by role',
      storePerformance: 'Store Performance',
      storePerformanceDescription: 'Sales performance per store',
      errorLoading: 'Error Loading Analytics Data',
      errorLoadingDescription: 'Failed to fetch analytics data',
      tryAgain: 'Try Again',
    },
    userManagement: {
      title: 'User Management',
      subtitle: 'Manage users and approve new accounts',
      addNewUser: 'Add New User',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      pendingApproval: 'Pending Approval',
      suspended: 'Suspended',
      allUsers: 'All registered users',
      activeUsersDescription: 'Active users',
      pendingDescription: 'Awaiting approval',
      suspendedDescription: 'Suspended users',
      filterSearch: 'Filter & Search',
      filterSearchDescription: 'Search and filter users by criteria',
      searchPlaceholder: 'Search by email or name...',
      filterRole: 'Filter Role',
      filterStatus: 'Filter Status',
      allRoles: 'All Roles',
      allStatus: 'All Status',
      active: 'Active',
      pending: 'Pending',
      userList: 'User List',
      usersCount: 'of',
      noUsersFound: 'No users found',
      joinedOn: 'Joined:',
      approve: 'Approve',
      reject: 'Reject',
      suspend: 'Suspend',
      activate: 'Activate',
      editUser: 'Edit User',
      deleteUser: 'Delete User',
      addUserTitle: 'Add New User',
      addUserDescription: 'Create a new user account with role assignment',
      editUserTitle: 'Edit User',
      editUserDescription: 'Update user information and role assignment',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Enter full name',
      emailPlaceholder: 'Enter email address',
      passwordPlaceholder: 'Enter password',
      selectRole: 'Select role',
      selectStatus: 'Select status',
      inactive: 'Inactive',
      creating: 'Creating...',
      createUser: 'Create User',
      updating: 'Updating...',
      updateUser: 'Update User',
      deleteConfirmTitle: 'Are you sure?',
      deleteConfirmDescription: 'This action cannot be undone. This will permanently delete the user account and remove all associated data.',
      deleting: 'Deleting...',
      userApproved: 'User approved',
      userApprovedDescription: 'User has been successfully activated',
      userRejected: 'User rejected',
      userRejectedDescription: 'User has been successfully suspended',
      userSuspended: 'User suspended',
      userSuspendedDescription: 'User has been successfully suspended',
      userActivated: 'User activated',
      userActivatedDescription: 'User has been successfully activated',
      userAdded: 'User successfully added',
      userAddedDescription: 'with role',
      userUpdated: 'User successfully updated',
      userUpdatedDescription: 'User data has been successfully updated',
      userDeleted: 'User successfully deleted',
      userDeletedDescription: 'has been successfully deleted',
      approveError: 'Failed to approve user',
      rejectError: 'Failed to reject user',
      suspendError: 'Failed to suspend user',
      activateError: 'Failed to activate user',
      addError: 'Failed to add user',
      updateError: 'Failed to update user',
      deleteError: 'Failed to delete user',
      accessDenied: 'Access denied',
      accessDeniedDescription: 'You do not have permission to create new users',
      authFailed: 'Authentication failed',
      authFailedDescription: 'Please login again',
      sessionExpired: 'Session expired',
      sessionExpiredDescription: 'Please login again',
      emailExists: 'Email already registered',
      emailExistsDescription: 'The entered email is already used by another user',
      unknownError: 'An unknown error occurred',
      noValidSession: 'No valid session found. Please login again.',
      failedToCreateUser: 'Failed to create user',
    },
    products: {
      errorFetchingCategories: 'Failed to load categories',
      errorFetchingProducts: 'Failed to load products',
      validation: {
        nameRequired: 'Product name is required',
        nameMinLength: 'Product name minimum 3 characters',
        skuRequired: 'SKU is required',
        skuMinLength: 'SKU minimum 3 characters',
        categoryRequired: 'Category must be selected',
        priceRequired: 'Price must be greater than 0',
        minimumStockRequired: 'Minimum stock must be at least 1',
        skuExists: 'SKU is already used by another product',
      },
      productUpdated: 'Product successfully updated',
      productAdded: 'Product successfully added',
    },
    staff: {
      title: 'Staff Management',
      subtitle: 'Manage staff and system access control',
      inviteStaff: 'Invite Staff',
      editStaff: 'Edit Staff',
      deleteStaff: 'Delete Staff',
      staffManagement: 'Staff Management',
      totalStaff: 'Total Staff',
      activeStaff: 'Active Staff',
      pendingInvites: 'Pending Invites',
      warehouseStaff: 'Warehouse Staff',
      kasirStaff: 'Cashier Staff',
      searchPlaceholder: 'Search staff...',
      allRoles: 'All Roles',
      allStatus: 'All Statuses',
      allBranches: 'All Branches',
      noStaffFound: 'No staff found',
      lastLogin: 'Last Login',
      invitation: 'Invitation',
      password: 'Password',
      actions: 'Actions',
      branch: 'Branch',
      editStaffAction: 'Edit Staff',
      managePermissions: 'Manage Permissions',
      resendInvitation: 'Resend Invitation',
      copyPassword: 'Copy Password',
      viewActivity: 'View Activity',
      activate: 'Activate',
      deactivate: 'Deactivate',
      deleteStaffAction: 'Delete Staff',
      inviteNewStaff: 'Invite New Staff',
      addStaffMemberDescription: 'Add new staff member with secure password setup',
      staffName: 'Staff Name',
      email: 'Email',
      role: 'Role',
      permissions: 'Permissions',
      passwordSetup: 'Password Setup',
      sendWelcomeEmail: 'Send Welcome Email',
      generatePassword: 'Generate Password',
      manualPassword: 'Manual Password',
      invitationEmail: 'Invitation Email',
      customPassword: 'Custom Password',
      showPassword: 'Show Password',
      hidePassword: 'Hide Password',
      passwordStrength: 'Password Strength',
      inviteStaffButton: 'Invite Staff',
      cancel: 'Cancel',
      updateStaff: 'Update Staff',
      staffAdded: 'Staff added',
      staffUpdated: 'Data updated',
      staffDeleted: 'Staff deleted',
      invitationSent: 'Invitation sent',
      invitationResent: 'Invitation sent',
      passwordCopied: 'Password copied',
      failedToAddStaff: 'Failed to add staff',
      failedToUpdateStaff: 'Failed to update staff data',
      failedToDeleteStaff: 'Failed to delete staff',
      failedToLoadStaffData: 'Failed to load staff data',
      passwordOptions: {
        generate: {
          label: 'Auto Generate Password',
          description: 'System will create a secure temporary password',
        },
        manual: {
          label: 'Set Manual Password',
          description: 'Admin sets password for staff',
        },
        invitation: {
          label: 'Send Email Invitation',
          description: 'Staff will receive email to set their own password',
        },
      },
      roles: {
        admin: 'Admin',
        kasir: 'Cashier',
        warehouse: 'Warehouse',
      },
      status: {
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending',
      },
      invitationStatus: {
        sent: 'Sent',
        accepted: 'Accepted',
        expired: 'Expired',
        resent: 'Resent',
      },
      passwordStatus: {
        temporary: 'Temporary',
        permanent: 'Permanent',
        notSet: 'Not Set',
      },
      messages: {
        passwordEmpty: 'Password empty',
        passwordEmptyDescription: 'Password must be filled to continue',
        passwordWeak: 'Password weak',
        passwordWeakDescription: 'Password does not meet required security criteria',
        staffActivated: 'activated',
        staffDeactivated: 'deactivated',
        staffStatusChanged: 'successfully',
        mustChange: 'Must change',
        expired: 'Expired',
        copy: 'Copy',
      },
    },
    stock: {
      errorFetchingProducts: 'Failed to load products',
      errorFetchingStores: 'Failed to load store data',
      errorFetchingMovements: 'Failed to load stock history',
    },
    stores: {
      errorLoadingData: 'Failed to load data',
      title: 'Store Management',
      subtitle: 'Manage store branches and monitor sales performance',
      addStore: 'Add Store',
      editStore: 'Edit Store',
      deleteStore: 'Delete Store',
      storeManagement: 'Store Management',
      totalStores: 'Total Stores',
      totalStaff: 'Total Staff',
      monthlyRevenue: 'Monthly Revenue',
      averagePerStore: 'Average per Store',
      active: 'active',
      fromLastMonth: '+12% from last month',
      averagePerStoreRevenue: 'Average per Store',
      revenuePerBranch: 'Revenue per branch',
      storeList: 'Store Branch List',
      storeListDescription: 'Manage and monitor all your store branches',
      storeName: 'Store Name',
      location: 'Location',
      manager: 'Manager',
      staff: 'Staff',
      status: 'Status',
      monthlyRevenueLabel: 'Monthly Revenue',
      actions: 'Actions',
      edit: 'Edit',
      assignStaff: 'Assign Staff',
      delete: 'Delete',
      addNewStore: 'Add New Store',
      updateStoreInfo: 'Update existing store information',
      addNewBranch: 'Add new store branch to the system',
      address: 'Address',
      city: 'City',
      phone: 'Phone',
      optional: 'Optional',
      cancel: 'Cancel',
      update: 'Update',
      add: 'Add',
      assignStaffToStore: 'Assign Staff to Store',
      selectStaffToAssign: 'Select staff to assign to',
      availableStaff: 'Available Staff:',
      noAvailableStaff: 'No available staff',
      selectedStaff: 'Selected Staff:',
      currentlyAt: 'Currently at:',
      assignStaffCount: 'Assign Staff',
      storeUpdated: 'Store successfully updated',
      storeAdded: 'Store successfully added',
      storeDeleted: 'Store successfully deleted',
      staffAssigned: 'Staff successfully assigned to store',
      staffAssignedDescription: 'staff successfully assigned to',
      failedToSaveStore: 'Failed to save store data',
      failedToDeleteStore: 'Failed to delete store',
      errorLoadingStoresData: 'Error Loading Stores Data',
      tryAgain: 'Try Again',
      statusLabels: {
        active: 'Active',
        inactive: 'Inactive',
        maintenance: 'Maintenance',
      },
    },
    categories: {
      errorFetchingCategories: 'Failed to load categories',
      errorFetchingProducts: 'Failed to load products',
    },
    customers: {
      errorFetchingCustomers: 'Failed to load customer data',
      errorFetchingTransactions: 'Failed to load transaction history',
    },
    reports: {
      title: 'Stock Reports',
      subtitle: 'Monitor stock movements and inventory analysis',
      exportExcel: 'Export Excel',
      exportPDF: 'Export PDF',
      filterReport: 'Filter Reports',
      startDate: 'Start Date',
      endDate: 'End Date',
      category: 'Category',
      reportType: 'Report Type',
      allCategories: 'All Categories',
      stockSummary: 'Stock Summary',
      movementDetail: 'Movement Detail',
      categoryAnalysis: 'Category Analysis',
      totalProducts: 'Total Products',
      lowStock: 'Low Stock',
      inventoryValue: 'Inventory Value',
      movements: 'Movements',
      productsRegistered: 'Products registered',
      needRefill: 'Need refill',
      totalStockValue: 'Total stock value',
      inThisPeriod: 'In this period',
      stockIn: 'Stock In',
      stockOut: 'Stock Out',
      totalUnitsIn: 'Total units in during period',
      totalUnitsOut: 'Total units out during period',
      categoryBreakdown: 'Breakdown per Category',
      products: 'Products',
      totalStock: 'Total Stock',
      value: 'Value',
      movement: 'Movement',
      stockSummaryPerProduct: 'Stock Summary per Product',
      stockSummaryDescription: 'Detailed stock and movement report for each product',
      noDataForPeriod: 'No data for selected period',
      product: 'Product',
      currentStock: 'Current Stock',
      minStock: 'Min. Stock',
      totalIn: 'Total In',
      totalOut: 'Total Out',
      totalMovements: 'Movements',
      lastMovement: 'Last',
      status: 'Status',
      normal: 'Normal',
      running_low: 'Running Low',
      stockMovementDetail: 'Stock Movement Detail',
      stockMovementDescription: 'Complete stock movement history in selected period',
      noMovementInPeriod: 'No stock movements in selected period',
      date: 'Date',
      type: 'Type',
      quantity: 'Quantity',
      notes: 'Notes',
      by: 'By',
      in: 'In',
      out: 'Out',
      transfer: 'Transfer',
      adjustment: 'Adjustment',
      excelDownloaded: 'Excel report successfully downloaded',
      pdfDownloaded: 'PDF report successfully downloaded',
      categoryLabels: {
        device: 'Device',
        liquid: 'Liquid',
        peripheral: 'Peripheral',
        service: 'Service',
      },
    },
    auditLog: {
      title: 'Audit Logs',
      description: 'System and user activity history',
      action: 'Action',
      entity: 'Entity',
      user: 'User',
      details: 'Details',
      time: 'Time',
      view: 'View',
      noData: 'No audit log data',
      filters: {
        search: 'Search',
        actionType: 'Action Type',
        entity: 'Entity',
        all: 'All',
        startDate: 'Start Date',
        endDate: 'End Date',
        perPage: 'Per Page',
        moreFilters: 'More Filters',
        reset: 'Reset',
      },
      tabs: {
        changes: 'Changes',
        rawData: 'Raw Data',
      },
      labels: {
        before: 'Before',
        after: 'After',
        newData: 'New Data',
        deletedData: 'Deleted Data',
        noChanges: 'No changes detected',
        noData: 'No data',
      },
      stats: {
        totalLogs: 'Total Logs',
        today: 'Today',
        last24Hours: 'Last 24 Hours',
        last7Days: 'Last 7 Days',
      },
      realtime: {
        active: 'Realtime Active',
        offline: 'Offline',
      },
      export: {
        csv: 'Export CSV',
      },
    },
  },
};

// Export getPricingPlans function
export const getPricingPlans = (language: 'id' | 'en') => [
  {
    id: 'single_store' as const,
    name: translations[language].landing.pricing.plans[0].name,
    description: '',
    monthlyPrice: 50000,
    yearlyPrice: 500000,
    originalYearlyPrice: 600000,
    maxStores: 1,
    features: translations[language].landing.pricing.plans[0].features,
  },
  {
    id: 'multi_store_5' as const,
    name: translations[language].landing.pricing.plans[1].name,
    description: '',
    monthlyPrice: 150000,
    yearlyPrice: 1500000,
    originalYearlyPrice: 1800000,
    maxStores: 5,
    features: translations[language].landing.pricing.plans[1].features,
  },
  {
    id: 'multi_store_20' as const,
    name: translations[language].landing.pricing.plans[2].name,
    description: '',
    monthlyPrice: 250000,
    yearlyPrice: 2500000,
    originalYearlyPrice: 3000000,
    maxStores: 20,
    features: translations[language].landing.pricing.plans[2].features,
  },
  {
    id: 'multi_store_unlimited' as const,
    name: translations[language].landing.pricing.plans[3].name,
    description: '',
    monthlyPrice: 350000,
    yearlyPrice: 3500000,
    originalYearlyPrice: 4200000,
    maxStores: translations[language].common.unlimited,
    features: translations[language].landing.pricing.plans[3].features,
  },
];
