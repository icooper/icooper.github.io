---
layout: post
title: Functional VGL List Class
date: 2019-06-25
---

The scripting language used inside of SampleManager, VGL, has basic multidimensional array datatypes for fixed-length and variable-length arrays. In addition to the usual array accessor, there are some routines in the core `STD_ARRAY` library to do some basic manipulation of arrays. Most of the names are self-explanatory:

* `array_copy`
* `array_element_exists`
* `array_get_dimensions`
* `array_insert_slice`
* `array_remove_slice`
* `array_sort`
* `array_complex_sort` (for multidimensional arrays)

Over time, using modern languages like C# or JavaScript, I've become accustomed to having a more fully-featured Array datatype, so I set out to create something to make my life a little easier in VGL. I implemented a 1-dimensional `LIST` class, using the [JavaScript Array object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) as a model for which actions I implemented.

## API Summary

Here's an summary of the `LIST` API:

### Create a new list

```vgl
JOIN LIBRARY lib_list

DECLARE list

lib_list_define_list_class()
CREATE OBJECT LIST_CLASS, list
```

As with many VGL class-oriented libraries, a routine to define the class needs to be called before the class itself is available for instantiation.

### Add elements to the list

```vgl
                       { list contents                              }
list.append(1)         { [1]                                        }
list.append(2)         { [1  2]                                     }
list.push(3)           { [1  2  3]                                  }
list.unshift(4)        { [4  1  2  3]                               }
```

The `append` and `push` actions are identical, adding a new element to the end of the list. The `unshift` action adds a new element to the beginning of the list.

### Access elements of the list by index

```vgl
                       { list contains: [4  1  2  3]                }
list.get(3)            { action returns: 2                          }
list.set(3, 5)         { list contains: [4  1  5  3]                }
```

### Removing elements of the list

```vgl
                       { list contents                              }
                       { [4  1  5  3]                               }
list.remove(1)         { [1  5  3]                                  }
list.pop()             { [1  5]      pop() returns 3                }
list.shift()           { [5]         shift() returns 1              }
```

Corresponding to `unshift` and `push`, `shift` and `pop` remove and return the first and last elements of the list, respectively. The `remove` action returns the list object rather than the element that was removed.

### Order elements of the list

```vgl
                       { list contents                              }
                       { [1  2  3  4]                               }
list.reverse()         { [4  3  2  1]                               }
```

There is a `reverse` action to reverse the order of the elements in the list, but no `sort` action.

### Slice and splice

```vgl
                       { list contains: [a  b  c  d  e]             }
list.slice(2, 4)       { action returns: [b  c]                     }
list.slice(-3, EMPTY)  { action returns: [c  d  e]                  }
list.slice(EMPTY, -2)  { action returns: [a  b  c]                  }
```

The `slice` action is used to copy a range of elements into a new list without modfying the original list.

```vgl
                       { list contains: [a  b  c  d  e  f  g]       }
list.splice(2, 4)      { action returns: [b  c  d  e]               }
                       { list now contains: [a  b  f  g]            }
```

The `splice` action is used to return a range of elements from the original list, removing them from the original list. This differs from the [JavaScript `Array.splice` method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) in that it cannot be used to insert or replace existing elements.

### Filter

```vgl
                       { list contains: [a  b  b  c  d  a]          }
list.distinct()        { action returns: [a  b  c  d]               }
```

The `distinct` action returns a new list with all of the distinct elements in the original list. Elements appear in the returned list in the order in which they first appear in the original list. The original list is not modified.

### Bounds

```vgl
                       { list contains: [a  b  c  a  d]             }
list.inBounds(0)       { action returns: FALSE                      }
list.inBounds(3)       { action returns: TRUE                       }
list.inBounds(6)       { action returns: FALSE                      }
```

The `inBounds` action returns TRUE if the given index is contained within the list. Remember, list indexes are 1-based in order to be consistent with VGL array indexes.

```vgl
                       { list contains: [a  b  c  a  d]             }
list.length            { statement value: 5                         }
```

There is also a `length` property containing the number of elements in the list. It should not be modified from outside the class actions, but it can be read.

### Contents

```vgl
                       { list contains: [a  b  c  a  d]             }
list.indexOf(a)        { action returns: 1                          }
list.indexOf(c)        { action returns: 3                          }
list.indexOf(e)        { action returns: 0                          }

list.lastIndexOf(a)    { action returns: 4                          }
list.lastIndexOf(c)    { action returns: 3                          }

list.includes(a)       { action returns: TRUE                       }
list.includes(e)       { action returns: FALSE                      }
```

The `indexOf` and `lastIndexOf` return the index of the first or last (respectively) occurrence of a given element in the list. If the element is not found in the list, the action returns `0`. The `includes` action returns `TRUE` if the given element is included in the list---it is implemented by returning `TRUE` if `indexOf` is greater than `0`.

### Chaining

```vgl
                       { list contains: [1  2  3  4]                }
list.push(5).unshift(6).remove(2).pop()
                       { action returns: 5                          }
                       { list now contains [6  2  3  4]             }
```

Many actions that result in the list being modified will return a reference to the modified list. This allows multiple actions to be chained together in the same statement.

### Output

```vgl
                       { list contains: [1  2  3]                   }
list.join(", ")        { action returns: "1, 2, 3"                  }
list.join("|")         { action returns: "1|2|3"                    }
list.join(" and ")     { action returns: "1 and 2 and 3"            }
list.toString()        { action returns: "[1,2,3]"                  }
```

The `join` action returns a string containing the list elements delimited by the specified string. The `toString` action returns a human-readable string containing the contents of the list suitable for logging or debugging purposes.

## GitHub Repository

I have created [a GitHub repository for this library](https://github.com/icooper/vgl-lib_list) and released it under the [MIT License](https://choosealicense.com/licenses/mit/), which makes it easy to use in your own projects. If you have any problems with the library or suggestions on how it could be extended or improved, please [create an issue](https://github.com/icooper/vgl-lib_list/issues) or [submit a pull request](https://github.com/icooper/vgl-lib_list/pulls) so that they can be tracked effectively.

If you find this useful and end up using it in a project, [I'd love to know about it]({% link contact.md %}).
