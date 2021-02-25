function toFixed( num, precision ) {
    return parseFloat((+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision));
}

function averageRating(data = []) {
    const { reviews } = data[0];
    
    const sum = reviews.reduce((sum, obj) => {
        sum += obj.rating;
        return sum;
    }, 0)

    return toFixed(sum / reviews.length, 1);
}

module.exports = {
    averageRating
}