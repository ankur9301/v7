export const getTodayDateString = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }
  