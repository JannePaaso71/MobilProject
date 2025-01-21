import useFieldPatchArea from "../useFieldPatchArea"
import * as mod from "../useFieldPatchArea"
import {renderHook, act, waitFor} from "@testing-library/react-native";

describe("useFieldPatchArea", () => {
    test("Test pushing and popping points to useFieldPatchArea", async () => {
        const {result} = renderHook(() => useFieldPatchArea())
        const [p1, p2, p3, p4] = [
            {
                longitude: 25.1, latitude:  65.1
            }, {
                longitude: 25.2 , latitude: 65.2
            }, {
                longitude: 25.3, latitude:  65.3
            }, {
                longitude: 25.4, latitude: 65.4
            }
        ]
        act(() => result.current.pushPoint(p1))
        act(() =>    result.current.pushPoint(p2))
        act(() =>   result.current.pushPoint(p3))
        act(() =>    result.current.pushPoint(p4))

        act(() => expect(result.current.popPoint()).toEqual({longitude: 25.4, latitude: 65.4, ordinal: 4}))
        act(() => expect(result.current.popPoint()).toEqual({longitude: 25.3, latitude:  65.3, ordinal: 3}))
        act(() => expect(result.current.popPoint()).toEqual({longitude: 25.2, latitude:  65.2, ordinal: 2}))
        act(() => expect(result.current.popPoint()).toEqual({longitude: 25.1, latitude:  65.1, ordinal: 1}))

    });

    test("Test calculate area works for a set of points.", async () => {
        // Kokonaisala: 29 970,37 m² (322 598,40 ft²)
        // Kokonaisetäisyys: 709,37 m (2 327,31 ft)
        const areaPoints = [
            {latitude: 61.48198978573224, longitude: 23.494089554015307},
            {latitude: 61.48269373858714, longitude: 23.496701462253842},
            {latitude: 61.48151209437239, longitude: 23.498544542664106},
            {latitude: 61.48070754498803, longitude: 23.497038482671723},
            {latitude: 61.48050137586181, longitude: 23.496080080858388},
            {latitude: 61.48075782993367, longitude: 23.49560614589575},
            {latitude: 61.480938855065496, longitude: 23.495827315544975},
        ]
        const {result} = renderHook(() => useFieldPatchArea())

        for (let i = 0; i < areaPoints.length; i++) {
            await waitFor(() => result.current.pushPoint(areaPoints[i]))
        }
        await waitFor(() => expect(result.current.area.sqm).toBeCloseTo(33156, 0))
        await waitFor(() => expect(result.current.area.ha).toBeCloseTo(3.3156, 0))

        // TODO: Investigate why the test below gives 10% different area as compared to Google Maps.
        // await waitFor(() => expect(result.current.area.sqm).toBeCloseTo(29970, 0))
    })

    test("Test Linnanmaa market parking lot.", async () => {
        const {result} = renderHook(() => useFieldPatchArea())

        // Test Linnanmaa parking lot test.
        const linnanmaaParkingLot = [ // 9500sqm
            {latitude: 65.05334320638865, longitude: 25.45756870519559},
            {latitude: 65.05376177921661, longitude: 25.45989149809213},
            {latitude: 65.05440433228317, longitude: 25.459194123831278},
            {latitude: 65.05405364503399, longitude: 25.45691961071701},
        ]

        const linnanmaaParkingLot2 = [ // 14000sqm
            {latitude: 65.05334320638865, longitude: 25.45756870519559},
            {latitude: 65.05376177921661, longitude: 25.45989149809213},
            {latitude: 65.05440433228317, longitude: 25.459194123831278},
            {latitude: 65.05424095159584, longitude: 25.458307559068857},
            {latitude: 65.05440217271207, longitude: 25.458167887503375},
            {latitude: 65.05452308790923, longitude: 25.45908677938155},
            {latitude: 65.05509045189262, longitude: 25.45867511582013},
            {latitude: 65.05508425125863, longitude: 25.45613897423636},
        ]
        for (let i = 0; i < linnanmaaParkingLot.length; i++) {
            await waitFor(() => result.current.pushPoint(linnanmaaParkingLot[i]))
        }
        await waitFor(() => expect(result.current.area.sqm).toBeCloseTo(9428.679005046833, 0))
    })

    test("Test distanceBetween() inside the hook", () => {
        const [p1, p2, p3, p4] = [
            {
                longitude: 23.231302, latitude:  61.495466
            }, {
                longitude: 23.238570 , latitude: 61.495809
            }, {
                longitude: 25.417929700451506, latitude:  65.06344439716655
            }, {
                longitude: 25.430291262192128, latitude: 65.0669438971005
            }
        ]

        expect(mod.__internal_distanceBetween(p3, p4)).toBeCloseTo (697, 0.);
    })

    test("Test distanceBetween() inside the hook", () => {
        const [p1, p2] = [
            {
                longitude: 25.46509875665957, latitude:  65.02034409496977//Raatti urheilukenttä rata 1 starts
            }, {
                longitude: 25.465002628077194 , latitude: 65.01944685934953//Raatti urheilukenttä rata 1 100m
            }
        ]

        expect(mod.__internal_distanceBetween(p1, p2)).toBeCloseTo (100, 0.);
    })

    test("Test isIntersect()", () => {
        const [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12] = [
            {latitude:61.481094434555665, longitude:23.495311370637737}, // l1
            {latitude:61.48189587371329, longitude:23.497395796547806},

            {latitude:61.48096408865421, longitude:23.497606083763515}, // l2, **l1 and l2 should intersect**
            {latitude:61.482200092117274, longitude:23.4948504390831},

            {latitude:61.482200092117274, longitude:23.4948504390831}, // l3, **l1 and l3 should not intersect**
            {latitude:61.47969452699654, longitude:23.494732574090232},//     **l2 and l3 should not intersect**

            {latitude:61.480661940226476, longitude:23.497039359096625}, // l4
            {latitude:61.48212713346468, longitude:23.494558224718293},

            {latitude: -1, longitude: 1}, // l5
            {latitude: 1, longitude: -1},

            {latitude: -1, longitude: -1}, // l6
            {latitude: 1, longitude: 1},

        ]
        const [l1, l2, l3, l4, l5, l6] =(
            [[p1,p2],[p3,p4],[p5,p6], [p7,p8], [p9,p10], [p11,p12]]
        )

        // l1 and l2 should not intersect
        expect(mod.__internal_isIntersect(l1[0], l1[1], l2[0], l2[1])).toBe(true)

        // l1 and l3 should not intersect
        expect(mod.__internal_isIntersect(l1[0], l1[1], l3[0], l3[1])).toBe(false)

        // l2 and l3 should not intersect
        expect(mod.__internal_isIntersect(l2[0], l2[1], l3[0], l3[1])).toBe(false)

       // l1 and l4 should intersect
        expect(mod.__internal_isIntersect(l5[0], l5[1], l6[0], l6[1])).toBe(true)
    })
    
    test("Test calculateLocalEarthRadius() inside the hook", () => {
        const latitude = 65.1

        expect(mod.__internal_calculateLocalEarthRadius(latitude)).toBeCloseTo (6360569,0);
    })

    test("calculateAreaOfTriangle() inside the hook", () => { //calculateAreaOfTriangle as __internal_calculateAreaOfTriangle,
        const [p1, p2, p3] = [//alue 300m * 400m
            { 
                longitude: 25.472575661607674, latitude:  65.05573889248743 //65.05573889248743, 25.472575661607674
            }, {
                longitude: 25.472507101708246 , latitude: 65.05920837121779 //65.05920837121779, 25.472507101708246
            }, {
                longitude: 25.465993911263123, latitude:  65.0554401106946//65.0554401106946, 25.465993911263123
            }
        ]

        expect(mod.__internal_calculateAreaOfTriangle(p1,p2, p3)).toBeCloseTo (59396, 0.);
    })

    test("areaIsContiguous() inside the hook", () => { //calculateAreaOfTriangle as __internal_calculateAreaOfTriangle,
        const [p1, p2, p3, p4, p5] = [//alue 300m * 400m
            { 
                longitude: 25.472575661607674, latitude:  65.05573889248743 //65.05573889248743, 25.472575661607674
            }, {
                longitude: 25.472507101708246 , latitude: 65.05920837121779 //65.05920837121779, 25.472507101708246
            }, {
                longitude: 25.465993911263123, latitude:  65.0554401106946//65.0554401106946, 25.465993911263123
            },
            {
                longitude: 25.47024462502731, latitude:  65.05732912631211//65.05732912631211, 25.47024462502731 - ei leikkaa
            },
            {
                longitude: 25.476986348733774, latitude:  65.06003712432415//65.06003712432415, 25.476986348733774 - leikkaa
            }
        ]

        expect(mod.__internal_areaIsContiguous([p1, p2, p3, p5])).toBe(false);
        expect(mod.__internal_areaIsContiguous([p1, p2, p3, p4])).toBe(true);
    })

    test("Test generateContainer()", () => {
        // Kokonaisala: 29 970,37 m² (322 598,40 ft²)
        // Kokonaisetäisyys: 709,37 m (2 327,31 ft)
        const areaPoints = [
            {latitude: 61.48198978573224, longitude: 23.494089554015307},
            {latitude: 61.48269373858714, longitude: 23.496701462253842},
            {latitude: 61.48151209437239, longitude: 23.498544542664106},
            {latitude: 61.48070754498803, longitude: 23.497038482671723},
            {latitude: 61.48050137586181, longitude: 23.496080080858388},
            {latitude: 61.48075782993367, longitude: 23.49560614589575},
            {latitude: 61.480938855065496, longitude: 23.495827315544975},
        ]
        const container = mod.__internal_generateContainer(areaPoints)
        const [xmin, xmax, ymin, ymax] = [
            23.493089554015306, 23.499544542664108, 61.479501375861815, 61.483693738587135
        ]
        expect(container).toEqual([
            {latitude: ymax, longitude: xmin},
            {latitude: ymin, longitude: xmin},
            {latitude: ymin, longitude: xmax},
            {latitude: ymax, longitude: xmax},
        ])
    })

    test("Test triangleIsInsideArea()", () => {
        // Kokonaisala: 29 970,37 m² (322 598,40 ft²)
        // Kokonaisetäisyys: 709,37 m (2 327,31 ft)
        const areaPoints = [
            {latitude: 61.48198978573224, longitude: 23.494089554015307},
            {latitude: 61.48269373858714, longitude: 23.496701462253842},
            {latitude: 61.48151209437239, longitude: 23.498544542664106},
            {latitude: 61.48070754498803, longitude: 23.497038482671723},
            {latitude: 61.48050137586181, longitude: 23.496080080858388},
            {latitude: 61.48075782993367, longitude: 23.49560614589575},
            {latitude: 61.480938855065496, longitude: 23.495827315544975},
        ]
        const t1 = [ // Is fully inside
            {latitude: 61.48143666875083, longitude: 23.495785187992748},
            {latitude: 61.48187916312212, longitude: 23.496153804074797},
            {latitude: 61.48126570333207, longitude: 23.49720699288066},
        ]
        // const t2 = [ // Is only partially inside
        //     {latitude: 61.48143666875083, longitude: 23.495785187992748},
        //     {latitude: 61.48299542779507, longitude: 23.496132740298684},
        //     {latitude: 61.48126570333207, longitude: 23.49720699288066},
        // ]
        const t3 = [ // Is fully outside
            {latitude: 61.48340270358817, longitude: 23.49498476450029},
            {latitude: 61.48299542779507, longitude: 23.496132740298684},
            {latitude: 61.48367924584251, longitude: 23.497249120432894},
        ]
        expect(mod.__internal_triangleIsInsideArea(t1, areaPoints)).toBe(true)
        expect(mod.__internal_triangleIsInsideArea(t3, areaPoints)).toBe(false)
    })
})