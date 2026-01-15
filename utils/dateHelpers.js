const getDayRange = (dateInput) => {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return null;
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
};

module.exports = { getDayRange };
