class Trail {
    constructor(trailObject) {
      this.id = trailObject["id"]
      this.hiking_project_id = trailObject["hiking_project_id"]
      this.name = trailObject["name"]
      this.latitude = trailObject["latitude"]
      this.longitude = trailObject["longitude"]
      this.length = trailObject["length"]
      this.summary = trailObject["summary"],
      this.stars = trailObject["stars"],
      this.starVotes = trailObject["starVotes"],
      this.location = trailObject["location"],
      this.imgSqSmall = trailObject["imgSqSmall"],
      this.imgSmall = trailObject["imgSmall"],
      this.imgSmallMed = trailObject["imgSmallMed"],
      this.imgMedium = trailObject["imgMedium"],
      this.difficulty = trailObject["difficulty"],
      this.ascent = trailObject["ascent"],
      this.descent = trailObject["descent"],
      this.high = trailObject["high"],
      this.low = trailObject["low"],
      this.url = trailObject["url"],
      this.conditionStatus =  trailObject["conditionStatus"],
      this.conditionDetails = trailObject["conditionDetails"],
      this.conditionDate = trailObject["conditionDate"],
      this.detail_views = trailObject["detail_views"]
    }
  }