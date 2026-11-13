/**
 * Every string the settings blocks show. Pass a partial object as `labels`
 * (on `SettingsLayout`, or on a single block) and the rest keeps its
 * default; `settingsLabelsHu` is the Hungarian set, ready to pass whole.
 */
export interface SettingsLabels {
  common: {
    edit: string;
    add: string;
    save: string;
    cancel: string;
    close: string;
    next: string;
    back: string;
    notSet: string;
    saved: string;
    failed: string;
    copy: string;
    copied: string;
    currentPassword: string;
    /** Shown instead of the password field when the account has none. */
    recentSignInNote: string;
    nav: string;
  };
  sections: {
    profile: string;
    security: string;
    organization: string;
  };
  profile: {
    title: string;
    description: string;
    photo: string;
    photoDescription: string;
    upload: string;
    remove: string;
    photoSaved: string;
    photoRemoved: string;
    name: string;
    nameDescription: string;
    username: string;
    usernameDescription: string;
    email: string;
    emailDescription: string;
    verified: string;
    unverified: string;
    pending: (address: string) => string;
    change: string;
  };
  email: {
    title: string;
    description: string;
    newEmail: string;
    send: string;
    sent: (address: string) => string;
    cancelChange: string;
    changeCancelled: string;
  };
  password: {
    row: string;
    rowDescription: (changedAt?: string) => string;
    set: string;
    change: string;
    title: string;
    description: string;
    newPassword: string;
    tooShort: string;
    signOutOthers: string;
    changed: string;
  };
  twoFactor: {
    row: string;
    rowDescription: string;
    on: string;
    off: string;
    setUp: string;
    turnOff: string;
    step: (step: number, of: number) => string;
    scanTitle: string;
    scanDescription: string;
    qrAlt: string;
    orEnterKey: string;
    codeTitle: string;
    codeDescription: string;
    verify: string;
    wrongCode: string;
    backupTitle: string;
    backupDescription: string;
    done: string;
    enabled: string;
    disableTitle: string;
    disableDescription: string;
    disabled: string;
  };
  identities: {
    title: string;
    connect: string;
    disconnect: string;
    notConnected: string;
    connectedSince: (date: string) => string;
    disconnected: string;
    lastMethod: string;
  };
  sessions: {
    title: string;
    thisDevice: string;
    signOut: string;
    signOutOthers: string;
    signOutOthersDescription: string;
    signedOut: string;
    othersSignedOut: string;
  };
  danger: {
    title: string;
    deleteAccount: string;
    deleteAccountDescription: string;
    deleteAccountTitle: string;
    deleteAccountBody: string;
    deleteAccountConfirm: string;
  };
  organization: {
    title: string;
    description: string;
    readOnly: string;
    logo: string;
    logoDescription: string;
    name: string;
    nameDescription: string;
    address: string;
    addressDescription: string;
    leave: string;
    leaveDescription: string;
    leaveTitle: string;
    leaveBody: string;
    delete: string;
    deleteDescription: string;
    deleteTitle: string;
    deleteBody: string;
    typeToConfirm: (slug: string) => string;
  };
  /** Formats the dates rows show. */
  formatDate: (iso: string) => string;
}

const formatDate = (locale: string) => (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
};

export const defaultSettingsLabels: SettingsLabels = {
  common: {
    edit: "Edit",
    add: "Add",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    next: "Next",
    back: "Back",
    notSet: "Not set",
    saved: "Saved",
    failed: "Something went wrong. Try again.",
    copy: "Copy",
    copied: "Copied",
    currentPassword: "Current password",
    recentSignInNote:
      "Your account has no password, so this needs a sign-in from the last few minutes.",
    nav: "Settings sections",
  },
  sections: {
    profile: "Profile",
    security: "Sign-in & security",
    organization: "Organization",
  },
  profile: {
    title: "Profile",
    description: "How you appear to your team.",
    photo: "Photo",
    photoDescription: "PNG or JPG, cropped square",
    upload: "Upload",
    remove: "Remove",
    photoSaved: "Photo saved",
    photoRemoved: "Photo removed",
    name: "Name",
    nameDescription: "Shown in the header and on invitations",
    username: "Username",
    usernameDescription: "Your handle in mentions and links",
    email: "Email",
    emailDescription: "Where sign-in links and receipts go",
    verified: "Verified",
    unverified: "Not verified",
    pending: (address) => `Waiting for confirmation from ${address}`,
    change: "Change",
  },
  email: {
    title: "Change email",
    description: "We send a link to the new address. Nothing changes until it is clicked.",
    newEmail: "New email",
    send: "Send link",
    sent: (address) => `Confirmation link sent to ${address}`,
    cancelChange: "Cancel change",
    changeCancelled: "Email change cancelled",
  },
  password: {
    row: "Password",
    rowDescription: (changedAt) =>
      changedAt ? `Last changed ${changedAt}` : "Sign in with your email and a password",
    set: "Set password",
    change: "Change",
    title: "Change password",
    description: "At least 8 characters.",
    newPassword: "New password",
    tooShort: "Use at least 8 characters.",
    signOutOthers: "Sign out other devices",
    changed: "Password changed",
  },
  twoFactor: {
    row: "Two-step verification",
    rowDescription: "A code from an authenticator app at every sign-in",
    on: "On",
    off: "Off",
    setUp: "Set up",
    turnOff: "Turn off",
    step: (step, of) => `Step ${step} of ${of}`,
    scanTitle: "Set up two-step verification",
    scanDescription:
      "Scan the code with an authenticator app, such as 1Password or Google Authenticator.",
    qrAlt: "QR code for your authenticator app",
    orEnterKey: "Or enter this key",
    codeTitle: "Enter the 6-digit code",
    codeDescription: "The code from your app shows that it is set up right.",
    verify: "Verify",
    wrongCode: "That code did not match. Check the app and try again.",
    backupTitle: "Save your backup codes",
    backupDescription: "Each code works once, if you lose your phone. They are not shown again.",
    done: "Done",
    enabled: "Two-step verification is on",
    disableTitle: "Turn off two-step verification?",
    disableDescription: "Enter a code from your authenticator app to turn it off.",
    disabled: "Two-step verification is off",
  },
  identities: {
    title: "Connected accounts",
    connect: "Connect",
    disconnect: "Disconnect",
    notConnected: "Not connected",
    connectedSince: (date) => `Connected ${date}`,
    disconnected: "Disconnected",
    lastMethod:
      "This is your only way to sign in. Set a password or connect another account first.",
  },
  sessions: {
    title: "Signed-in devices",
    thisDevice: "This device",
    signOut: "Sign out",
    signOutOthers: "Sign out everywhere else",
    signOutOthersDescription: "Ends every session except this one",
    signedOut: "Signed out",
    othersSignedOut: "Signed out of every other device",
  },
  danger: {
    title: "Danger zone",
    deleteAccount: "Delete account",
    deleteAccountDescription: "Removes your profile and sign-in for good",
    deleteAccountTitle: "Delete your account?",
    deleteAccountBody:
      "Your profile and sign-in are removed for good. Organizations you own must be handed over or deleted first.",
    deleteAccountConfirm: "Delete account",
  },
  organization: {
    title: "Organization",
    description: "Owners and admins can edit these.",
    readOnly: "Only owners and admins can change these.",
    logo: "Logo",
    logoDescription: "Square, shown in the switcher",
    name: "Name",
    nameDescription: "Shown to members",
    address: "Address",
    addressDescription: "Part of every link to this organization, so it never changes",
    leave: "Leave organization",
    leaveDescription: "You lose access until someone invites you again",
    leaveTitle: "Leave this organization?",
    leaveBody: "You lose access to everything in it until someone invites you again.",
    delete: "Delete organization",
    deleteDescription: "Deletes everything in it for good",
    deleteTitle: "Delete this organization?",
    deleteBody: "Everything in it is deleted for every member. This cannot be undone.",
    typeToConfirm: (slug) => `Type ${slug} to confirm`,
  },
  formatDate: formatDate("en-GB"),
};

export const settingsLabelsHu: SettingsLabels = {
  common: {
    edit: "Szerkesztés",
    add: "Hozzáadás",
    save: "Mentés",
    cancel: "Mégse",
    close: "Bezárás",
    next: "Tovább",
    back: "Vissza",
    notSet: "Nincs megadva",
    saved: "Mentve",
    failed: "Valami hiba történt. Próbáld újra.",
    copy: "Másolás",
    copied: "Másolva",
    currentPassword: "Jelenlegi jelszó",
    recentSignInNote:
      "A fiókodnak nincs jelszava, ezért ehhez az elmúlt pár percben be kell jelentkezned.",
    nav: "Beállítások",
  },
  sections: {
    profile: "Profil",
    security: "Belépés és biztonság",
    organization: "Szervezet",
  },
  profile: {
    title: "Profil",
    description: "Így látnak a csapattársaid.",
    photo: "Fotó",
    photoDescription: "PNG vagy JPG, négyzetesre vágva",
    upload: "Feltöltés",
    remove: "Eltávolítás",
    photoSaved: "Fotó mentve",
    photoRemoved: "Fotó eltávolítva",
    name: "Név",
    nameDescription: "A fejlécben és a meghívókban látszik",
    username: "Felhasználónév",
    usernameDescription: "Ezzel hivatkoznak rád említésekben és linkekben",
    email: "E-mail",
    emailDescription: "Ide érkeznek a belépési linkek és a számlák",
    verified: "Megerősítve",
    unverified: "Nincs megerősítve",
    pending: (address) => `Megerősítésre vár: ${address}`,
    change: "Módosítás",
  },
  email: {
    title: "E-mail-cím módosítása",
    description: "Linket küldünk az új címre. Amíg nem kattintasz rá, semmi nem változik.",
    newEmail: "Új e-mail-cím",
    send: "Link küldése",
    sent: (address) => `Megerősítő linket küldtünk ide: ${address}`,
    cancelChange: "Módosítás visszavonása",
    changeCancelled: "Az e-mail-cím módosítása visszavonva",
  },
  password: {
    row: "Jelszó",
    rowDescription: (changedAt) =>
      changedAt ? `Utoljára módosítva: ${changedAt}` : "Belépés e-mail-címmel és jelszóval",
    set: "Jelszó beállítása",
    change: "Módosítás",
    title: "Jelszó módosítása",
    description: "Legalább 8 karakter.",
    newPassword: "Új jelszó",
    tooShort: "Legalább 8 karaktert adj meg.",
    signOutOthers: "Kijelentkezés a többi eszközön",
    changed: "Jelszó módosítva",
  },
  twoFactor: {
    row: "Kétlépcsős azonosítás",
    rowDescription: "Hitelesítő alkalmazás kódja minden belépésnél",
    on: "Be",
    off: "Ki",
    setUp: "Beállítás",
    turnOff: "Kikapcsolás",
    step: (step, of) => `${step}. lépés / ${of}`,
    scanTitle: "Kétlépcsős azonosítás beállítása",
    scanDescription:
      "Olvasd be a kódot egy hitelesítő alkalmazással, például 1Passworddel vagy Google Authenticatorral.",
    qrAlt: "QR-kód a hitelesítő alkalmazáshoz",
    orEnterKey: "Vagy írd be ezt a kulcsot",
    codeTitle: "Írd be a 6 jegyű kódot",
    codeDescription: "Az alkalmazás kódjából látjuk, hogy minden rendben van.",
    verify: "Ellenőrzés",
    wrongCode: "A kód nem egyezik. Nézd meg az alkalmazást, és próbáld újra.",
    backupTitle: "Mentsd el a tartalékkódokat",
    backupDescription:
      "Mindegyik egyszer használható, ha elveszik a telefonod. Többé nem mutatjuk meg őket.",
    done: "Kész",
    enabled: "A kétlépcsős azonosítás bekapcsolva",
    disableTitle: "Kikapcsolod a kétlépcsős azonosítást?",
    disableDescription: "A kikapcsoláshoz írj be egy kódot a hitelesítő alkalmazásból.",
    disabled: "A kétlépcsős azonosítás kikapcsolva",
  },
  identities: {
    title: "Összekapcsolt fiókok",
    connect: "Összekapcsolás",
    disconnect: "Leválasztás",
    notConnected: "Nincs összekapcsolva",
    connectedSince: (date) => `Összekapcsolva: ${date}`,
    disconnected: "Leválasztva",
    lastMethod:
      "Csak így tudsz belépni. Előbb állíts be jelszót, vagy kapcsolj össze egy másik fiókot.",
  },
  sessions: {
    title: "Bejelentkezett eszközök",
    thisDevice: "Ez az eszköz",
    signOut: "Kijelentkeztetés",
    signOutOthers: "Kijelentkezés mindenhol máshol",
    signOutOthersDescription: "Minden munkamenetet lezár, kivéve ezt",
    signedOut: "Kijelentkeztetve",
    othersSignedOut: "Kijelentkeztél minden más eszközön",
  },
  danger: {
    title: "Veszélyzóna",
    deleteAccount: "Fiók törlése",
    deleteAccountDescription: "Véglegesen törli a profilodat és a belépésedet",
    deleteAccountTitle: "Törlöd a fiókodat?",
    deleteAccountBody:
      "A profilod és a belépésed véglegesen törlődik. A saját szervezeteidet előbb add át vagy töröld.",
    deleteAccountConfirm: "Fiók törlése",
  },
  organization: {
    title: "Szervezet",
    description: "A tulajdonosok és az adminok szerkeszthetik.",
    readOnly: "Ezeket csak a tulajdonosok és az adminok módosíthatják.",
    logo: "Logó",
    logoDescription: "Négyzetes, a szervezetváltóban látszik",
    name: "Név",
    nameDescription: "A tagok ezt látják",
    address: "Cím",
    addressDescription: "Minden link része, ezért nem változik",
    leave: "Kilépés a szervezetből",
    leaveDescription: "Elveszíted a hozzáférést, amíg újra meg nem hívnak",
    leaveTitle: "Kilépsz a szervezetből?",
    leaveBody: "Mindenhez elveszíted a hozzáférést, amíg valaki újra meg nem hív.",
    delete: "Szervezet törlése",
    deleteDescription: "Mindent véglegesen töröl benne",
    deleteTitle: "Törlöd a szervezetet?",
    deleteBody: "Minden tag számára minden törlődik. Ez nem vonható vissza.",
    typeToConfirm: (slug) => `A megerősítéshez írd be: ${slug}`,
  },
  formatDate: formatDate("hu-HU"),
};
