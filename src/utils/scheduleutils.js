// functions to calculate hypothetical collection schedules


export function getValidCollectionDays(startDate, 
    excludedMonths = [11, 12, 1, 2], 
    maxProjectDuration = 36, 
    excludedDays = [6, 7]) {
    let start = new Date(startDate);
    let end = new Date(start);
    end.setDate(start.getDate() + maxProjectDuration * 30);

    let validDates = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
    let month = currentDate.getMonth() + 1; // JavaScript months are 0-based
    let dayOfWeek = currentDate.getDay() + 1; // JS Sunday is 0, adjust to match isoweekday()

    if (!excludedMonths.includes(month) && !excludedDays.includes(dayOfWeek)) {
    validDates.push(currentDate.toISOString().split('T')[0]);
    }

    currentDate.setDate(currentDate.getDate() + 1);
    }
    return validDates;
}

function sortDates(dateStrings) {
    return dateStrings.sort((a, b) => new Date(a) - new Date(b));
}

export function computeDays(numCollections, numDevices, validDays, startDate, efficiencyModifier) {
    let schedule = [];
    let index = 0;

    console.log(numCollections);
    console.log(numDevices);
    //console.log(validDays);
    console.log(startDate);
    console.log(efficiencyModifier);

    for (let date of validDays) {
        for (let systemNumber = 1; systemNumber <= numDevices; systemNumber++) {
            if (Math.random() > efficiencyModifier) {
            continue;
            }

            if (index >= numCollections) {
            break;
            }

            index++;
            schedule.push([date, systemNumber]);
        }
    }

    let lastCollectionDate = schedule.length > 0 ? schedule[schedule.length - 1][0] : null;
    let totalDays = lastCollectionDate ? (new Date(lastCollectionDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1 : 0;
    let totalCollects = schedule.length;

    console.log(totalDays);

    return [totalDays, lastCollectionDate, totalCollects < numCollections, schedule];
}