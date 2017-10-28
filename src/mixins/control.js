((() => {
  window.app.mixins.control = {
    methods: {
      animate() {
        let boardDidChange = this.mergeAnimationsList.length > 0 || this.slideAnimationsList.length > 0

        if (boardDidChange) {
          while (this.mergeAnimationsList.length > 0) {
            let animation = this.mergeAnimationsList.splice(0, 1)[0]
            this.updateScore(animation)
            this.animateTiles(animation)
          }
          while (this.slideAnimationsList.length > 0) {
            let animation = this.slideAnimationsList.splice(0, 1)[0]
            this.animateTiles(animation)
          }
          setTimeout(() => {
            this.seedTwo()
          }, 100)
        }

      },
      animateTiles(animation) {
        let { from, to } = animation

        let a = this.board[from]
        let b = this.board[to]
        a.value = a.value + b.value
        b.value = 0

        this.board.splice(from, 1)
        this.board.splice(from, 0, b)
        
        this.board.splice(to, 1)
        this.board.splice(to, 0, a)
      },
      updateScore(animation) {
        let { from, to } = animation

        let a = this.board[from]
        let b = this.board[to]
        let points = a.value + b.value

        this.$store.dispatch("updateScore", points)
      },

      getChangeLists(type) {
        let changeLists = {}
        if (type === "animate") {
          changeLists.merge = this.mergeAnimationsList
          changeLists.slide = this.slideAnimationsList
        } else if (type === "gamestate") {
          changeLists.merge = this.mergeGameStateList
          changeLists.slide = this.slideGameStateList
        }
        return changeLists
      },

      moveRight(type = "animate") {
        let changeLists = this.getChangeLists(type)

        let board = _.cloneDeep(_.chunk(this.board, 4))
        for (var a = 0; a < board.length; a++) {
          this.mergeRight(board, a, changeLists)
          this.slideRight(board, a, changeLists)
        }
      },

      mergeRight(board, a, changeLists) {
        let i = board.length - 2
        let j = board.length - 1

        // updated all the possible merge values
        // think of i, j  pointers in the board
        // if they become separate, the pointers will try from catch up
        while (i >= 0) {
          if (board[a][i].value === 0 && board[a][j].value === 0) { // if both elements are zero
            j --
            i --
          } else if (board[a][i].value === board[a][j].value) { // if two elements have same value

            changeLists.merge.push({from: (a * 4 + i), to: (a * 4 + j)})

            board[a][j].value = board[a][i].value + board[a][j].value
            board[a][i].value = 0
            j--
            i--
          } else if (board[a][j].value === 0) { // if the right most has 0
            j--
            i--
          } else if (board[a][i].value != 0 && board[a][j].value != 0 && (i + 1 == j)) { // if both are non zero and next from each other
            j--
            i--
          } else if (board[a][i].value != 0 && board[a][j].value != 0) { // if both are non zero and not next from each other
            j--
          } else if (board[a][i].value === 0) { // if the left most element is zero
            i--
          }
        }
      },

      slideRight(board, a, changeLists) {
        let k = board.length - 2
        let l = board.length - 1
        while (k >= 0) {
          if (board[a][l].value !== 0) { // if right most element is 0
            l --
            k --
          } else if (board[a][l].value !== 0 && board[a][k].value !== 0) { // if right most and left most elements are not 0
            l --
            k --
          } else if (board[a][l].value === 0 && board[a][k].value === 0) { // if right most and left most elements are 0
            k --
          } else if (board[a][l].value === 0 && board[a][k].value !== 0) { // if right most element is 0 and left most element is not 0

            changeLists.slide.push({from: (a * 4 + k), to: (a * 4 + l)})

            board[a][l].value = board[a][k].value + board[a][l].value
            board[a][k].value = 0
            l --
            k --
          }
        }
      },

      moveLeft(type = "animate") {
        let changeLists = this.getChangeLists(type)

        let board = _.cloneDeep(_.chunk(this.board, 4))
        for (var a = 0; a < board.length; a++) {
          this.mergeLeft(board, a, changeLists)
          this.slideLeft(board, a, changeLists)
        }
      },

      mergeLeft(board, a, changeLists) {
        let i = 1
        let j = 0

        while (i < board.length) {
          if (board[a][i].value === 0 && board[a][j].value === 0) {
            j++
            i++
          } else if (board[a][i].value === board[a][j].value) { // if two elements have same value

            changeLists.merge.push({from: (a * 4 + i), to: (a * 4 + j)})

            board[a][j].value = board[a][i].value + board[a][j].value
            board[a][i].value = 0
            j++
            i++
          } else if (board[a][j].value === 0) { // if the left most ele has 0
            j++
            i++
          } else if (board[a][i].value != 0 && board[a][j].value != 0 && (i - 1 == j)) { // if both are non zero and next from each other
            j++
            i++
          } else if (board[a][i].value != 0 && board[a][j].value != 0) { // if both are non zero and not next from each other
            j++
          } else if (board[a][i].value === 0) { // if the right most ele has 0
            i++
          }
        }
      },

      slideLeft(board, a, changeLists) {
        let k = 1
        let l = 0
        while (k < board.length) {
          if (board[a][l].value !== 0) { // if left most element is 0
            l ++
            k ++
          } else if (board[a][l].value !== 0 && board[a][k].value !== 0) { // if left most and right most elements are not 0
            l ++
            k ++
          } else if (board[a][l].value === 0 && board[a][k].value === 0) { // if left most and right most elements are 0
            k ++
          } else if (board[a][l].value === 0 && board[a][k].value !== 0) { // if left most element is 0 and right most element is not 0

            changeLists.slide.push({from: (a * 4 + k), to: (a * 4 + l)})

            board[a][l].value = board[a][k].value + board[a][l].value
            board[a][k].value = 0
            l ++
            k ++
          }
        }
      },

      moveDown(type = "animate") {
        let changeLists = this.getChangeLists(type)

        let board = _.cloneDeep(_.chunk(this.board, 4))
        for (var a = 0; a < board.length; a++) {
          this.mergeDown(board, a, changeLists)
          this.slideDown(board, a, changeLists)
        }
      },

      mergeDown(board, a, changeLists) {
        let i = board.length - 2
        let j = board.length - 1

        while (i >= 0) {
          if (board[i][a].value === 0 && board[j][a].value === 0) {
            j--
            i--
          } else if (board[i][a].value === board[j][a].value) {

            changeLists.merge.push({from: (i * 4 + a), to: (j * 4 + a)})

            board[j][a].value = board[i][a].value + board[j][a].value
            board[i][a].value = 0
            j--
            i--
          } else if (board[j][a].value === 0) {
            j--
            i--
          } else if (board[i][a].value != 0 && board[j][a].value != 0 && (i + 1 == j)) {
            j--
            i--
          } else if (board[i][a].value != 0 && board[j][a].value != 0) {
            j--
          } else if (board[i][a].value === 0) {
            i--
          }
        }
      },

      slideDown(board, a, changeLists) {
        let k = board.length - 2
        let l = board.length - 1
        while (k >= 0) {
          if (board[l][a].value !== 0) { // if botfromm most element is 0
            l --
            k --
          } else if (board[l][a].value !== 0 && board[k][a].value !== 0) { // if botfromm most and fromp most elements are not 0
            l --
            k --
          } else if (board[l][a].value === 0 && board[k][a].value === 0) { // if botfromm most and fromp most elements are 0
            k --
          } else if (board[l][a].value === 0 && board[k][a].value !== 0) { // if botfromm most element is 0 and fromp most element is not 0

            changeLists.slide.push({from: (k * 4 + a), to: (l * 4 + a)})

            board[l][a].value = board[k][a].value + board[l][a].value
            board[k][a].value = 0
            l --
            k --
          }
        }
      },

      moveUp(type = "animate") {
        let changeLists = this.getChangeLists(type)

        let board = _.cloneDeep(_.chunk(this.board, 4))
        for (var a = 0; a < board.length; a++) {
          this.mergeUp(board, a, changeLists)
          this.slideUp(board, a, changeLists)
        }
      },

      mergeUp(board, a, changeLists) {
        let i = 1
        let j = 0
        while (i < board.length) {
          if (board[i][a].value === 0 && board[j][a].value === 0) {
            j++
            i++
          } else if (board[i][a].value === board[j][a].value) {

            changeLists.merge.push({from: (i * 4 + a), to: (j * 4 + a)}) // add animation data

            board[j][a].value = board[i][a].value + board[j][a].value
            board[i][a].value = 0
            j++
            i++
          } else if (board[j][a].value === 0) {
            j++
            i++
          } else if (board[i][a].value != 0 && board[j][a].value != 0 && (i - 1 == j)) {
            j++
            i++
          } else if (board[i][a].value != 0 && board[j][a].value != 0) {
            j++
          } else if (board[i][a].value === 0) {
            i++
          }
        }
      },

      slideUp(board, a, changeLists) {
        let k = 1
        let l = 0
        while (k < board.length) {
          if (board[l][a].value !== 0) { // if fromp most element is 0
            l ++
            k ++
          } else if (board[l][a].value !== 0 && board[k][a].value !== 0) { // if fromp most and botfromm most elements are not 0
            l ++
            k ++
          } else if (board[l][a].value === 0 && board[k][a].value === 0) { // if fromp most and botfromm most elements are 0
            k ++
          } else if (board[l][a].value === 0 && board[k][a].value !== 0) { // if fromp most element is 0 and botfromm most element is not 0

            changeLists.slide.push({from: (k * 4 + a), to: (l * 4 + a)}) // add animation data

            board[l][a].value = board[k][a].value + board[l][a].value
            board[k][a].value = 0
            l ++
            k ++
          }
        }
      },

      registerControl() {
        const validKeyCodes = [39, 37, 38, 40]
        document.addEventListener("keydown", (event) => {
          let key = event.which
          if (_.includes(validKeyCodes, key)) {
            if (key === 39) {
              // right
              this.moveRight()
            } else if (key === 37) {
              // left
              this.moveLeft()
            } else if (key === 38) {
              // up
              this.moveUp()
            } else if (key === 40) {
              // down
              this.moveDown()
            }
            this.animate()
          } else { return }
        })
      }
    }
  }
}))()
