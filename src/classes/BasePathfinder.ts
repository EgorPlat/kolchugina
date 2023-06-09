import {ComputeMethods} from '../enums';
import graphStore from "../stores/GraphStore";
import Point from "./Point";
import Connection from "./Connection";
import {PathI} from "../interfaces";

export default class BasePathfinder {
    paths: PathI[]

    constructor() {
        this.paths = []
    }

    computePath(
        matrix: number[][],
        startPointIndex: number,
        finishPointIndex: number,
        method: ComputeMethods = ComputeMethods.Dijkstra,
    ) {
        let distances
        let distance

        if (method === ComputeMethods.Dijkstra) {
            distances = this.dijkstra(matrix, startPointIndex)
            distance = distances[finishPointIndex]
        }
        if (method === ComputeMethods.Floyd) {
            distances = this.floyd(matrix)
            distance = distances[startPointIndex][finishPointIndex]
        }
        
        const paths = this.pathsFromMatrix(matrix, method)
        const fullPaths = this.computeFullPaths(paths, startPointIndex)

        if (fullPaths[finishPointIndex][0] !== undefined) {
            const path = fullPaths[finishPointIndex]
            this.paths = [path]
            return [distance, path]
        } else {
            return [Infinity, []]
        }
    }

    dijkstra(matrix: number[][], startPointIndex?: number) {
        if (startPointIndex !== undefined) return this.dijkstraPoint(matrix, startPointIndex)
        else {
            const distances = []
            for (let i = 0; i < matrix.length; i++) {
                const result = this.dijkstraPoint(matrix, i)
                distances.push(result)
            }
            return distances
        }
    }

    floyd(matrix: number[][]) {
        const matrixCopy = BasePathfinder.cloneMatrix(matrix)
        for (let k = 0; k < matrixCopy.length; k++) {
            for (let i = 0; i < matrixCopy.length; i++) {
                for (let j = 0; j < matrixCopy.length; j++) {
                    if (matrixCopy[i][j] > matrixCopy[i][k] + matrixCopy[k][j]) {
                        matrixCopy[i][j] = matrixCopy[i][k] + matrixCopy[k][j]
                    }
                }
                if (matrixCopy[i][i] < 0) {
                    throw new Error('Нет решения')
                }
            }
        }
        return matrixCopy
    }

    dijkstraPoint(matrix: number[][], startPointIndex: number) {
        let i: number | undefined = startPointIndex
        let viewed: number[] = [startPointIndex]
        let result = new Array(matrix.length).fill(Infinity)
        result[startPointIndex] = 0
        
        while (i !== undefined) {
            for (let j = 0; j < matrix.length; j++) {
                if (!viewed.includes(j) && result[j] > result[i] + matrix[i][j]) {
                    result[j] = result[i] + matrix[i][j]
                }
            }
            i = BasePathfinder.minDistance(result, viewed)
            if (i !== undefined) viewed.push(i)
        }
        return result
    }

    private static minDistance(distances: any[], viewed: number[]): number | undefined {
        let nextPoint
        let max = Infinity
        for (let i = 0; i < distances.length; i++) {
            if (distances[i] < max && !viewed.includes(i)) {
                max = distances[i]
                nextPoint = i
            }
        }
        return nextPoint
    }

    get adjacencyMatrixValues(): number[][] {
        const matrixValues = BasePathfinder.cloneMatrix(graphStore.adjacencyMatrix)
        matrixValues.shift()
        matrixValues.forEach(row => row.shift())
        return matrixValues
    }

    private static cloneMatrix(matrix: any[][]): number[][] {
        const matrix_ = [...new Array(matrix.length).fill(undefined)]
        for (let i = 0; i < matrix.length; i++) {
            matrix_[i] = [...new Array(matrix.length).fill(undefined)]
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] instanceof Point) {
                    const {x, y, colour, key} = matrix[i][j] as Point
                    matrix_[i][j] = new Point(x, y, colour, [], key)
                }
                if (matrix[i][j] instanceof Connection) {
                    const {from, to, weight, colour, key} = matrix[i][j] as Connection
                    matrix_[i][j] = new Connection(
                        new Point(from.x, from.y, from.colour, [], from.key),
                        new Point(to.x, to.y, to.colour, [], to.key),
                        weight,
                        colour,
                        key
                    )
                }
                matrix_[i][j] = matrix[i][j]
            }
        }
        return matrix_
    }

    pathsFromMatrix(matrix: number[][], method: ComputeMethods = ComputeMethods.Dijkstra): number[][] {
        const paths: number[][] = BasePathfinder.initMatrixPaths(matrix)
        // if (method === ComputeMethods.Dijkstra) {
        for (let i = 0; i < matrix.length; i++) {
            let j: number | undefined = i
            const viewed = [j]
            const path = [...new Array(matrix.length).fill(undefined)]
            path[j] = j
            const result = [...new Array(matrix.length).fill(Infinity)]
            result[j] = 0

            while (j !== undefined) {
                for (let k = 0; k < matrix.length; k++) {
                    if (!viewed.includes(k) && result[k] > result[j] + matrix[j][k]) {
                        result[k] = result[j] + matrix[j][k]
                        path[k] = j
                    }
                }
                j = BasePathfinder.minDistance(result, viewed)
                if (j !== undefined) viewed.push(j)
            }
            paths[i] = path
        }
        // todo
        // } else {
        //     let matrixCopy = this.cloneMatrix(matrix)
        //     for (let k = 0; k < matrixCopy.length; k++) {
        //         for (let i = 0; i < matrixCopy.length; i++) {
        //             for (let j = 0; j < matrixCopy.length; j++) {
        //                 if (matrixCopy[i][j] > matrixCopy[i][k] + matrixCopy[k][j]) {
        //                     matrixCopy[i][j] = matrixCopy[i][k] + matrixCopy[k][j]
        //                     paths[i][j] = k
        //                 }
        //             }
        //             if (matrixCopy[i][i] < 0) {
        //                 throw new Error('Нет решения')
        //             }
        //         }
        //     }
        // }
        return paths
    }

    private static initMatrixPaths(matrix: number[][]): number[][] {
        const {length} = matrix
        const paths: number[][] = [...new Array(length).fill([])]
        for (let i = 0; i < length; i++) {
            paths[i] = [...new Array(length).fill(0)]
        }
        return paths
    }

    computeFullPaths(paths: any[], startPoint?: number): any[] {
        const allFullPaths = []

        for (let i = 0; i < paths.length; i++) {
            const fullPaths = []
            for (let j = 0; j < paths[i].length; j++) {
                let start = i
                let finish = j
                let fullPath: any = []

                if (paths[i][finish] !== undefined) fullPath = [finish]
                else fullPath = [undefined]

                while (finish !== undefined && start !== finish) {
                    finish = paths[i][finish]
                    fullPath.unshift(finish)
                }

                if (fullPath[0] !== undefined) fullPaths.push(fullPath)
                else fullPaths.push([fullPath[0]])
            }
            allFullPaths.push(fullPaths)
        }

        return startPoint !== undefined ? allFullPaths[startPoint] : allFullPaths
    }

    compareMethods(matrix: number[][], cyclesCount = 10000): { dijkstra: number, floyd: number } {
        const dijkstraStart = new Date().getTime()
        for (let i = 0; i < cyclesCount; i++) {
            this.dijkstra(matrix)
        }
        const dijkstraFinish = new Date().getTime()
        const floydStart = new Date().getTime()
        for (let i = 0; i < cyclesCount; i++) {
            this.floyd(matrix)
        }
        const floydFinish = new Date().getTime()
        return {dijkstra: dijkstraFinish - dijkstraStart, floyd: floydFinish - floydStart}
    }
}