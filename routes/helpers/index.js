function averageRating(data = []) {
    const { reviews } = data[0];
    
    const sum = reviews.reduce((sum, obj) => {
        sum += obj.rating;
        return sum;
    }, 0)

    return Math.round(sum / reviews.length);
}

module.exports = {
    averageRating
}