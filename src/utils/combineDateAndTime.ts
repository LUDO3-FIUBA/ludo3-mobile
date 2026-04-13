function combineDateAndTime(date: Date, time: Date): Date {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes()
    );
};

export default combineDateAndTime
