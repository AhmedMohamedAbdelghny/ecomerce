

export class ApiFeatures {
    constructor(mongooseQuery, queryString) {
        this.mongooseQuery = mongooseQuery
        this.queryString = queryString
    }


    pagination() {
        let page = this.queryString.page * 1 || 1
        if (page < 0) {
            page = 1
        }
        let limit = 2
        let skip = (page - 1) * limit
        this.mongooseQuery.find().skip(skip).limit(limit)
        this.page = page
        return this
    }
    filter() {
        let excludeQuery = ["page", "select", "sort", "search"]
        let filterQuery = { ...this.queryString }
        excludeQuery.forEach((e) => {
            delete filterQuery[e]
        })
        filterQuery = JSON.parse(JSON.stringify(filterQuery).replace(/(gt|gte|lt|lte)/, (match) => `$${match}`))
        this.mongooseQuery.find(filterQuery)
        return this
    }

    sort() {
        if (this.queryString.sort) {
            this.mongooseQuery.sort(this.queryString.sort.replaceAll(",", " "))
        }
        return this
    }

    select() {
        if (this.queryString.fields) {
            this.mongooseQuery.select(this.queryString.fields.replaceAll(",", " "))
        }
        return this
    }

    search() {
        if (this.queryString.search) {
            this.mongooseQuery.find({
                $or: [
                    { title: { $regex: this.queryString.search, $options: "i" } },
                    { description: { $regex: this.queryString.search, $options: "i" } },
                ]
            })
        }
        return this
    }

}