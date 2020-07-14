module.exports = {
    getTime: function () {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const d = new Date();
        const date = monthNames[d.getMonth()].substr(0, 3);
        const time = date + ' ' + d.getDate() + ',' + d.getFullYear();
        return time;
    }
};
