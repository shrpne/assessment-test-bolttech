// Helper function to check if task is finished (past finish date)
export const isTaskFinished = (_finishDate: Date|number|undefined|null): boolean => {
    if (!_finishDate) {
        return false;
    }
    const finishDate = new Date(_finishDate);
    const currentDate = new Date();
    return finishDate < currentDate;
};
