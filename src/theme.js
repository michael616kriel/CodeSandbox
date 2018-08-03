

var pallet = {
    primary : '#33536a',
    secondary : '#517F85',
    red : '#f20c45',
    green : '#579c87',
    yellow : '#eedd67',
}

module.exports = {

    // -------- Colors -----------
    'primary-color'         : pallet.primary,
    'info-color'             : pallet.primary,
    'success-color'         : pallet.green,
    'processing-color'    : pallet.primary,
    'error-color'          : pallet.red,
    'highlight-color'       : pallet.primary,
    'warning-color'         : pallet.yellow,
    'normal-color'          : pallet.primary,

    // Color used by default to control hover and active backgrounds and for
    // alert info backgrounds.
    'primary-1': pallet.primary,  // replace tint(primary-color, 90%)
    'primary-2': pallet.secondary,  // replace tint(primary-color, 80%)
    'primary-3': pallet.primary,  // unused
    'primary-4': pallet.primary,  // unused
    'primary-5': pallet.primary,  // color used to control the text color in many active and hover states, replace tint(primary-color, 20%)
    'primary-6': pallet.secondary,  // color used to control the text color of active buttons, don't use, use primary-color
    'primary-7': pallet.secondary,  // replace shade(primary-color, 5%)
    'primary-8:' : pallet.primary,  // unused
    'primary-9': pallet.primary,  // unused
    'primary-10': pallet.primary,  // unused

}



